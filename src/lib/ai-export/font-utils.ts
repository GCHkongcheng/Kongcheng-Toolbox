import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const FONT_FAMILY_NAME = "AiExportNotoSansSC";

const FONT_CANDIDATES = [
  process.env.AI_EXPORT_FONT_PATH,
  join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.ttf"),
  join(process.cwd(), "src", "assets", "fonts", "NotoSansSC-Regular.ttf"),
].filter((value): value is string => typeof value === "string" && value.length > 0);

let cachedFontFileUrl: string | null | undefined;

function resolveFontFileUrl() {
  if (cachedFontFileUrl !== undefined) {
    return cachedFontFileUrl;
  }

  for (const candidate of FONT_CANDIDATES) {
    if (existsSync(candidate)) {
      cachedFontFileUrl = pathToFileURL(candidate).href;
      return cachedFontFileUrl;
    }
  }

  cachedFontFileUrl = null;
  return null;
}

export function getAiExportSansFontFamily() {
  return `'${FONT_FAMILY_NAME}', 'Noto Sans SC', 'Microsoft YaHei UI', 'PingFang SC', sans-serif`;
}

export function getAiExportCodeFontFamily() {
  return `'${FONT_FAMILY_NAME}', 'Consolas', 'SFMono-Regular', monospace`;
}

export function buildAiExportFontFaceCss() {
  const fontFileUrl = resolveFontFileUrl();

  if (!fontFileUrl) {
    return "";
  }

  return `@font-face {
    font-family: "${FONT_FAMILY_NAME}";
    src: url("${fontFileUrl}") format("truetype");
    font-style: normal;
    font-weight: 400;
  }
  @font-face {
    font-family: "${FONT_FAMILY_NAME}";
    src: url("${fontFileUrl}") format("truetype");
    font-style: normal;
    font-weight: 700;
  }`;
}
