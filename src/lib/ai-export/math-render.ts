import { Buffer } from "node:buffer";
import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import { ensureAiExportFontRuntime } from "@/lib/ai-export/font-utils";

export interface FormulaAsset {
  dataUri: string;
  width: number;
  height: number;
  pngBuffer: Buffer;
}

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const tex = new TeX({
  packages: AllPackages,
  inlineMath: [["$", "$"], ["\\(", "\\)"]],
  displayMath: [["$$", "$$"], ["\\[", "\\]"]],
});

const svg = new SVG({
  fontCache: "none",
});

const html = mathjax.document("", {
  InputJax: tex,
  OutputJax: svg,
});

const formulaCache = new Map<string, Promise<FormulaAsset>>();

function extractSvgFragment(markup: string) {
  const match = markup.match(/<svg[\s\S]*<\/svg>/);

  if (!match) {
    throw new Error("Failed to extract SVG from MathJax output.");
  }

  return match[0].replace("<svg", '<svg overflow="visible"');
}

export async function renderFormulaAsset(
  formula: string,
  displayMode: boolean,
): Promise<FormulaAsset> {
  const normalized = formula.trim();
  const cacheKey = `${displayMode ? "display" : "inline"}:${normalized}`;
  const cached = formulaCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const assetPromise = (async () => {
    const node = html.convert(normalized, {
      display: displayMode,
    });
    const mathSvg = extractSvgFragment(adaptor.outerHTML(node));
    ensureAiExportFontRuntime();
    const { default: sharp } = await import("sharp");
    const { data, info } = await sharp(Buffer.from(mathSvg), {
      density: displayMode ? 216 : 120,
    })
      .png()
      .flatten({ background: "#ffffff" })
      .extend({
        top: displayMode ? 12 : 6,
        bottom: displayMode ? 12 : 6,
        left: displayMode ? 16 : 8,
        right: displayMode ? 16 : 8,
        background: "#ffffff",
      })
      .trim()
      .toBuffer({ resolveWithObject: true });

    return {
      dataUri: `data:image/png;base64,${data.toString("base64")}`,
      width: info.width,
      height: info.height,
      pngBuffer: data,
    };
  })();

  formulaCache.set(cacheKey, assetPromise);
  return assetPromise;
}
