import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const FONT_FAMILY_NAME = "AiExportNotoSansSC";

const FONT_CANDIDATES = [
  process.env.AI_EXPORT_FONT_PATH,
  join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.ttf"),
  join(process.cwd(), "src", "assets", "fonts", "NotoSansSC-Regular.ttf"),
].filter((value): value is string => typeof value === "string" && value.length > 0);

let cachedFontDataUri: string | null | undefined;

function resolveFontDataUri() {
  if (cachedFontDataUri !== undefined) {
    return cachedFontDataUri;
  }

  for (const candidate of FONT_CANDIDATES) {
    if (existsSync(candidate)) {
      const buffer = readFileSync(candidate);
      cachedFontDataUri = `data:font/ttf;base64,${buffer.toString("base64")}`;
      return cachedFontDataUri;
    }
  }

  cachedFontDataUri = null;
  return null;
}

export function getAiExportSansFontFamily() {
  return `'${FONT_FAMILY_NAME}', 'Noto Sans SC', 'Microsoft YaHei UI', 'PingFang SC', sans-serif`;
}

export function getAiExportCodeFontFamily() {
  return `'${FONT_FAMILY_NAME}', 'Consolas', 'SFMono-Regular', monospace`;
}

export function buildAiExportFontFaceCss() {
  const fontDataUri = resolveFontDataUri();

  if (!fontDataUri) {
    return "";
  }

  return `@font-face {
    font-family: "${FONT_FAMILY_NAME}";
    src: url("${fontDataUri}") format("truetype");
    font-style: normal;
    font-weight: 400;
    font-display: block;
  }
  @font-face {
    font-family: "${FONT_FAMILY_NAME}";
    src: url("${fontDataUri}") format("truetype");
    font-style: normal;
    font-weight: 700;
    font-display: block;
  }`;
}
