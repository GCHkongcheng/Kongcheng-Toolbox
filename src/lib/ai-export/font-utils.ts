import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const FONT_FAMILY_NAME = "AiExportNotoSansSC";
const FONT_FAMILY_REAL_NAME = "Noto Sans SC";

const FONT_CANDIDATES = [
  process.env.AI_EXPORT_FONT_PATH,
  join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.ttf"),
  join(process.cwd(), "src", "assets", "fonts", "NotoSansSC-Regular.ttf"),
].filter((value): value is string => typeof value === "string" && value.length > 0);

let cachedFontDataUri: string | null | undefined;
let cachedFontPath: string | null | undefined;
let didConfigureFontRuntime = false;

function escapeXmlAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function resolveFontPath() {
  if (cachedFontPath !== undefined) {
    return cachedFontPath;
  }

  for (const candidate of FONT_CANDIDATES) {
    if (existsSync(candidate)) {
      cachedFontPath = candidate;
      return cachedFontPath;
    }
  }

  cachedFontPath = null;
  return null;
}

function resolveFontDataUri() {
  if (cachedFontDataUri !== undefined) {
    return cachedFontDataUri;
  }

  const fontPath = resolveFontPath();

  if (fontPath) {
    const buffer = readFileSync(fontPath);
    cachedFontDataUri = `data:font/ttf;base64,${buffer.toString("base64")}`;
    return cachedFontDataUri;
  }

  cachedFontDataUri = null;
  return null;
}

export function ensureAiExportFontRuntime() {
  if (didConfigureFontRuntime) {
    return;
  }

  didConfigureFontRuntime = true;

  const fontPath = resolveFontPath();

  if (!fontPath) {
    return;
  }

  const fontCacheDir = join(tmpdir(), "ai-export-fontconfig-cache");
  const fontConfigPath = join(tmpdir(), "ai-export-fonts.conf");
  const previousFontConfigPath = process.env.FONTCONFIG_FILE;
  mkdirSync(fontCacheDir, { recursive: true });

  const previousFontConfigInclude =
    previousFontConfigPath && previousFontConfigPath !== fontConfigPath
      ? `  <include ignore_missing="yes">${escapeXmlAttribute(previousFontConfigPath)}</include>\n`
      : "";

  const fontsConf = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig>
${previousFontConfigInclude}  <rescan>
    <int>0</int>
  </rescan>
  <dir>${escapeXmlAttribute(dirname(fontPath))}</dir>
  <cachedir>${escapeXmlAttribute(fontCacheDir)}</cachedir>
  <alias>
    <family>${FONT_FAMILY_NAME}</family>
    <prefer>
      <family>${FONT_FAMILY_REAL_NAME}</family>
    </prefer>
  </alias>
  <match target="pattern">
    <test qual="any" name="family" compare="eq">
      <string>${FONT_FAMILY_NAME}</string>
    </test>
    <edit name="family" mode="prepend" binding="strong">
      <string>${FONT_FAMILY_REAL_NAME}</string>
    </edit>
  </match>
</fontconfig>`;

  writeFileSync(fontConfigPath, fontsConf);
  process.env.FONTCONFIG_FILE = fontConfigPath;
  process.env.PANGOCAIRO_BACKEND ??= "fontconfig";
}

export function getAiExportSansFontFamily() {
  return `${FONT_FAMILY_NAME}, '${FONT_FAMILY_REAL_NAME}', 'Microsoft YaHei UI', 'PingFang SC', sans-serif`;
}

export function getAiExportCodeFontFamily() {
  return `${FONT_FAMILY_NAME}, 'Consolas', 'SFMono-Regular', monospace`;
}

export function getAiExportDocumentFontFamily() {
  return FONT_FAMILY_REAL_NAME;
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
