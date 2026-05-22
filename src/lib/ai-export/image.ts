import type {
  Blockquote,
  Code,
  Content,
  Delete,
  Emphasis,
  Heading,
  InlineCode,
  Link,
  List,
  PhrasingContent,
  Root,
  Strong,
  Table,
  TableCell,
  Text,
} from "mdast";
import sharp from "sharp";
import { createStoredZip } from "@/lib/ai-export/archive";
import {
  buildAiExportFontFaceCss,
  getAiExportCodeFontFamily,
  getAiExportSansFontFamily,
} from "@/lib/ai-export/font-utils";
import { getSuggestedFileBase, parseMarkdown } from "@/lib/ai-export/markdown";
import {
  renderFormulaAsset,
  type FormulaAsset,
} from "@/lib/ai-export/math-render";

type ImageFormat = "png" | "jpg";

type InlineRenderable =
  | {
      kind: "text";
      text: string;
      bold?: boolean;
      italic?: boolean;
      code?: boolean;
      strike?: boolean;
      link?: string;
    }
  | {
      kind: "math";
      formula: string;
      asset: FormulaAsset;
    };

type LineItem =
  | {
      kind: "text";
      text: string;
      bold?: boolean;
      italic?: boolean;
      code?: boolean;
      strike?: boolean;
      link?: string;
      width: number;
    }
  | {
      kind: "math";
      asset: FormulaAsset;
      width: number;
      height: number;
    };

interface RenderedLine {
  items: LineItem[];
  height: number;
}

interface PageState {
  elements: string[];
}

interface RenderContext {
  pages: PageState[];
  page: PageState;
  y: number;
}

const PAGE_WIDTH = 1240;
const PAGE_HEIGHT = 1754;
const PAGE_PADDING_X = 92;
const PAGE_PADDING_Y = 96;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_PADDING_X * 2;
export const EXPORT_PAGE_WIDTH = PAGE_WIDTH;
export const EXPORT_PAGE_HEIGHT = PAGE_HEIGHT;
const BODY_COLOR = "#1f2937";
const MUTED_COLOR = "#6b7280";
const ACCENT_COLOR = "#b45309";
const BORDER_COLOR = "#d6d3d1";
const PAPER_COLOR = "#fffaf2";
const CODE_BG = "#f8fafc";
const HEADER_BG = "#f5efe6";
const SANS_FONT_FAMILY = getAiExportSansFontFamily();
const CODE_FONT_FAMILY = getAiExportCodeFontFamily();

interface InlineMathNode {
  type: "inlineMath";
  value: string;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function isCjk(char: string) {
  return /[\u2e80-\u9fff\uf900-\ufaff]/u.test(char);
}

function charWidth(char: string, fontSize: number, code = false) {
  if (char === "\t") {
    return fontSize * 2.4;
  }

  if (char === " ") {
    return fontSize * 0.34;
  }

  if (code) {
    return isCjk(char) ? fontSize : fontSize * 0.62;
  }

  if (isCjk(char)) {
    return fontSize;
  }

  if (/[A-Z]/.test(char)) {
    return fontSize * 0.66;
  }

  if (/[a-z0-9]/.test(char)) {
    return fontSize * 0.56;
  }

  return fontSize * 0.42;
}

function createPage(): PageState {
  return {
    elements: [
      `<rect width="${PAGE_WIDTH}" height="${PAGE_HEIGHT}" fill="${PAPER_COLOR}"/>`,
      `<rect x="56" y="56" width="${PAGE_WIDTH - 112}" height="${PAGE_HEIGHT - 112}" rx="28" fill="white" stroke="#efe8dc"/>`,
      `<style>${buildAiExportFontFaceCss()}</style>`,
    ],
  };
}

function buildSvg(page: PageState) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${PAGE_WIDTH}" height="${PAGE_HEIGHT}" viewBox="0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}">${page.elements.join("")}</svg>`;
}

function ensurePageSpace(context: RenderContext, blockHeight: number) {
  const bottom = PAGE_HEIGHT - PAGE_PADDING_Y;

  if (context.y + blockHeight <= bottom) {
    return;
  }

  const nextPage = createPage();
  context.pages.push(nextPage);
  context.page = nextPage;
  context.y = PAGE_PADDING_Y;
}

async function buildInlineRenderables(
  nodes: PhrasingContent[],
  marks: Omit<Extract<InlineRenderable, { kind: "text" }>, "kind" | "text"> = {},
): Promise<InlineRenderable[]> {
  const output: InlineRenderable[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case "text":
        output.push({
          kind: "text",
          text: (node as Text).value,
          ...marks,
        });
        break;
      case "strong":
        output.push(
          ...(await buildInlineRenderables((node as Strong).children, {
            ...marks,
            bold: true,
          })),
        );
        break;
      case "emphasis":
        output.push(
          ...(await buildInlineRenderables((node as Emphasis).children, {
            ...marks,
            italic: true,
          })),
        );
        break;
      case "delete":
        output.push(
          ...(await buildInlineRenderables((node as Delete).children, {
            ...marks,
            strike: true,
          })),
        );
        break;
      case "inlineCode":
        output.push({
          kind: "text",
          text: (node as InlineCode).value,
          ...marks,
          code: true,
        });
        break;
      case "inlineMath":
        output.push({
          kind: "math",
          formula: (node as InlineMathNode).value,
          asset: await renderFormulaAsset((node as InlineMathNode).value, false),
        });
        break;
      case "break":
        output.push({
          kind: "text",
          text: "\n",
          ...marks,
        });
        break;
      case "link":
        output.push(
          ...(await buildInlineRenderables((node as Link).children, {
            ...marks,
            link: (node as Link).url,
          })),
        );
        break;
      case "image":
        output.push({
          kind: "text",
          text: `[图片：${node.alt ?? "未命名图片"}]`,
          ...marks,
        });
        break;
      default:
        break;
    }
  }

  return output;
}

function pushTextItem(target: LineItem[], source: Extract<InlineRenderable, { kind: "text" }>, char: string, width: number) {
  const last = target[target.length - 1];

  if (
    last?.kind === "text" &&
    last.bold === source.bold &&
    last.italic === source.italic &&
    last.code === source.code &&
    last.strike === source.strike &&
    last.link === source.link
  ) {
    last.text += char;
    last.width += width;
    return;
  }

  target.push({
    kind: "text",
    text: char,
    width,
    bold: source.bold,
    italic: source.italic,
    code: source.code,
    strike: source.strike,
    link: source.link,
  });
}

function wrapInlineRenderables(
  items: InlineRenderable[],
  fontSize: number,
  maxWidth: number,
  firstPrefix = "",
  continuedPrefix = "",
): RenderedLine[] {
  const lines: RenderedLine[] = [];
  let currentItems: LineItem[] = [];
  let currentWidth = 0;

  const addPrefix = (prefix: string) => {
    for (const char of prefix) {
      const width = charWidth(char, fontSize, false);
      pushTextItem(currentItems, { kind: "text", text: "" }, char, width);
      currentWidth += width;
    }
  };

  const finishLine = () => {
    const lineHeight = Math.max(
      Math.round(fontSize * 1.65),
      ...currentItems.map((item) =>
        item.kind === "math" ? item.height + 10 : Math.round(fontSize * 1.65),
      ),
    );
    lines.push({
      items: currentItems,
      height: lineHeight,
    });
    currentItems = [];
    currentWidth = 0;
  };

  addPrefix(firstPrefix);

  for (const item of items) {
    if (item.kind === "text") {
      for (const char of item.text) {
        if (char === "\n") {
          finishLine();
          addPrefix(continuedPrefix);
          continue;
        }

        const width = charWidth(char, fontSize, item.code);

        if (currentWidth + width > maxWidth && currentItems.length > 0) {
          finishLine();
          addPrefix(continuedPrefix);
        }

        if (currentItems.length === 0 && char === " ") {
          continue;
        }

        pushTextItem(currentItems, item, char, width);
        currentWidth += width;
      }
      continue;
    }

    const width = item.asset.width;

    if (currentWidth + width > maxWidth && currentItems.length > 0) {
      finishLine();
      addPrefix(continuedPrefix);
    }

    currentItems.push({
      kind: "math",
      asset: item.asset,
      width: item.asset.width,
      height: item.asset.height,
    });
    currentWidth += width;
  }

  if (currentItems.length > 0) {
    finishLine();
  }

  if (lines.length > 0) {
    return lines;
  }

  const emptyLine: RenderedLine = {
    items: [{ kind: "text", text: " ", width: 8 }],
    height: Math.round(fontSize * 1.65),
  };

  return [emptyLine];
}

function renderLineSvg(line: RenderedLine, x: number, y: number, fontSize: number, color = BODY_COLOR) {
  const elements: string[] = [];
  let cursor = x;
  let currentText = "";
  let currentAttrs = "";

  for (const item of line.items) {
    if (item.kind === "text") {
      const attrs = [
        item.bold ? 'font-weight="700"' : "",
        item.italic ? 'font-style="italic"' : "",
        item.code
          ? `font-family="${CODE_FONT_FAMILY}"`
          : `font-family="${SANS_FONT_FAMILY}"`,
        item.link ? `fill="${ACCENT_COLOR}"` : "",
        item.strike ? 'text-decoration="line-through"' : "",
      ]
        .filter(Boolean)
        .join(" ");

      if (currentAttrs !== attrs && currentText) {
        elements.push(
          `<text x="${cursor - measureTextWidth(currentText, fontSize)}" y="${y}" ${currentAttrs} fill="${item.link ? ACCENT_COLOR : color}" font-size="${fontSize}">${currentText}</text>`,
        );
        currentText = "";
      }

      currentText += escapeXml(item.text);
      currentAttrs = attrs;
      cursor += item.width;
      continue;
    }

    if (currentText) {
      elements.push(
        `<text x="${cursor - measureTextWidth(currentText, fontSize)}" y="${y}" ${currentAttrs} fill="${color}" font-size="${fontSize}">${currentText}</text>`,
      );
      currentText = "";
      currentAttrs = "";
    }

    const top = y - line.height + (line.height - item.height) / 2;
    elements.push(
      `<image href="${item.asset.dataUri}" x="${cursor}" y="${top}" width="${item.width}" height="${item.height}" />`,
    );
    cursor += item.width;
  }

  if (currentText) {
    elements.push(
      `<text x="${cursor - measureTextWidth(currentText, fontSize)}" y="${y}" ${currentAttrs} fill="${color}" font-size="${fontSize}">${currentText}</text>`,
    );
  }

  return elements.join("");
}

function measureTextWidth(text: string, fontSize: number) {
  return Array.from(text.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">"))
    .reduce((sum, char) => sum + charWidth(char, fontSize, false), 0);
}

async function drawParagraphFromNodes(
  context: RenderContext,
  nodes: PhrasingContent[],
  options: {
    fontSize?: number;
    color?: string;
    marginBottom?: number;
    xOffset?: number;
    firstPrefix?: string;
    continuedPrefix?: string;
  } = {},
) {
  const {
    fontSize = 28,
    color = BODY_COLOR,
    marginBottom = 14,
    xOffset = 0,
    firstPrefix = "",
    continuedPrefix = "",
  } = options;
  const renderables = await buildInlineRenderables(nodes);
  const lines = wrapInlineRenderables(
    renderables,
    fontSize,
    CONTENT_WIDTH - xOffset,
    firstPrefix,
    continuedPrefix,
  );

  for (const line of lines) {
    ensurePageSpace(context, line.height + marginBottom);
    context.page.elements.push(
      renderLineSvg(
        line,
        PAGE_PADDING_X + xOffset,
        context.y + line.height - 6,
        fontSize,
        color,
      ),
    );
    context.y += line.height;
  }

  context.y += marginBottom;
}

async function drawHeading(context: RenderContext, node: Heading) {
  context.y += 8;
  const fontSize =
    node.depth === 1 ? 40 : node.depth === 2 ? 34 : node.depth === 3 ? 30 : 28;
  await drawParagraphFromNodes(context, node.children, {
    fontSize,
    marginBottom: node.depth === 1 ? 20 : 16,
  });
}

async function drawBlockquote(context: RenderContext, node: Blockquote, xOffset = 0) {
  const barX = PAGE_PADDING_X + xOffset;
  const startY = context.y;

  for (const child of node.children) {
    if (child.type === "paragraph") {
      await drawParagraphFromNodes(context, child.children, {
        fontSize: 27,
        color: MUTED_COLOR,
        marginBottom: 12,
        xOffset: xOffset + 28,
      });
    }
  }

  context.page.elements.push(
    `<line x1="${barX + 8}" y1="${startY + 8}" x2="${barX + 8}" y2="${Math.max(
      startY + 28,
      context.y - 16,
    )}" stroke="#d6d3d1" stroke-width="4" stroke-linecap="round"/>`,
  );
}

function drawCodeBlock(context: RenderContext, node: Code, xOffset = 0) {
  const lines = (node.value || " ").split("\n");
  const fontSize = 24;
  const lineHeight = 36;

  for (const line of lines) {
    ensurePageSpace(context, lineHeight + 16);
    context.page.elements.push(
      `<rect x="${PAGE_PADDING_X + xOffset}" y="${context.y}" width="${CONTENT_WIDTH - xOffset}" height="${lineHeight + 10}" rx="18" fill="${CODE_BG}" stroke="#e5e7eb"/>`,
      `<text x="${PAGE_PADDING_X + xOffset + 20}" y="${context.y + 30}" fill="${BODY_COLOR}" font-size="${fontSize}" font-family="${CODE_FONT_FAMILY}">${escapeXml(
        line.length > 0 ? line : " ",
      )}</text>`,
    );
    context.y += lineHeight + 16;
  }
}

async function drawMathBlock(context: RenderContext, formula: string) {
  const asset = await renderFormulaAsset(formula, true);
  ensurePageSpace(context, asset.height + 28);
  const x = PAGE_PADDING_X + Math.max(0, (CONTENT_WIDTH - asset.width) / 2);
  context.page.elements.push(
    `<image href="${asset.dataUri}" x="${x}" y="${context.y}" width="${asset.width}" height="${asset.height}" />`,
  );
  context.y += asset.height + 20;
}

async function drawList(context: RenderContext, list: List, depth = 0) {
  for (let index = 0; index < list.children.length; index += 1) {
    const item = list.children[index];
    const prefix = list.ordered ? `${(list.start ?? 1) + index}. ` : "• ";
    const continuedPrefix = " ".repeat(prefix.length + 1);
    const xOffset = depth * 28;
    let usedPrefix = false;

    for (const child of item.children) {
      if (child.type === "paragraph") {
        await drawParagraphFromNodes(context, child.children, {
          fontSize: 28,
          marginBottom: 10,
          xOffset,
          firstPrefix: usedPrefix ? "" : prefix,
          continuedPrefix: usedPrefix ? "" : continuedPrefix,
        });
        usedPrefix = true;
        continue;
      }

      if (child.type === "list") {
        await drawList(context, child, depth + 1);
        continue;
      }

      if (child.type === "code") {
        drawCodeBlock(context, child, xOffset + 24);
        continue;
      }

      if (child.type === "blockquote") {
        await drawBlockquote(context, child, xOffset + 24);
        continue;
      }
    }
  }
}

async function tableCellText(cell: TableCell) {
  const renderables = await buildInlineRenderables(cell.children as PhrasingContent[]);
  return renderables
    .map((item) => (item.kind === "text" ? item.text : item.formula))
    .join("");
}

async function drawTable(context: RenderContext, table: Table, xOffset = 0) {
  const columns = Math.max(...table.children.map((row) => row.children.length), 1);
  const tableWidth = CONTENT_WIDTH - xOffset;
  const columnWidth = tableWidth / columns;
  const fontSize = 24;
  const lineHeight = 34;

  for (let rowIndex = 0; rowIndex < table.children.length; rowIndex += 1) {
    const row = table.children[rowIndex];
    const cellTexts = await Promise.all(
      Array.from({ length: columns }, (_, index) =>
        row.children[index] ? tableCellText(row.children[index]) : Promise.resolve(" "),
      ),
    );
    const rowHeight =
      Math.max(
        ...cellTexts.map((text) =>
          Math.max(1, Math.ceil(text.length / Math.max(8, Math.floor(columnWidth / 16)))),
        ),
      ) *
        lineHeight +
      20;

    ensurePageSpace(context, rowHeight + 4);
    const top = context.y;

    for (let column = 0; column < columns; column += 1) {
      const left = PAGE_PADDING_X + xOffset + column * columnWidth;
      context.page.elements.push(
        `<rect x="${left}" y="${top}" width="${columnWidth}" height="${rowHeight}" fill="${
          rowIndex === 0 ? HEADER_BG : "white"
        }" stroke="${BORDER_COLOR}"/>`,
      );

      const lines = wrapInlineRenderables(
        [{ kind: "text", text: cellTexts[column] || " " }],
        fontSize,
        columnWidth - 24,
      );
      let lineY = top + 30;

      for (const line of lines) {
        context.page.elements.push(
          renderLineSvg(line, left + 12, lineY, fontSize, BODY_COLOR),
        );
        lineY += line.height;
      }
    }

    context.y += rowHeight;
  }

  context.y += 18;
}

async function drawBlock(context: RenderContext, node: Content) {
  switch (node.type) {
    case "heading":
      await drawHeading(context, node);
      return;
    case "paragraph":
      await drawParagraphFromNodes(context, node.children);
      return;
    case "math":
      await drawMathBlock(context, node.value);
      return;
    case "blockquote":
      await drawBlockquote(context, node);
      return;
    case "list":
      await drawList(context, node);
      return;
    case "table":
      await drawTable(context, node);
      return;
    case "code":
      drawCodeBlock(context, node);
      return;
    case "thematicBreak":
      ensurePageSpace(context, 40);
      context.page.elements.push(
        `<line x1="${PAGE_PADDING_X}" y1="${context.y + 12}" x2="${
          PAGE_WIDTH - PAGE_PADDING_X
        }" y2="${context.y + 12}" stroke="${BORDER_COLOR}" stroke-width="2"/>`,
      );
      context.y += 28;
      return;
    default:
      return;
  }
}

async function renderTree(tree: Root) {
  const firstPage = createPage();
  const context: RenderContext = {
    pages: [firstPage],
    page: firstPage,
    y: PAGE_PADDING_Y,
  };

  for (const node of tree.children) {
    await drawBlock(context, node);
  }

  return context.pages.map(buildSvg);
}

async function svgToBuffer(svg: string, format: ImageFormat) {
  const image = sharp(Buffer.from(svg));
  return format === "png"
    ? image.png().toBuffer()
    : image.jpeg({ quality: 92 }).toBuffer();
}

export async function renderMarkdownToImageBuffers(
  markdown: string,
  format: ImageFormat,
) {
  const normalized = markdown.trim();
  const tree = parseMarkdown(normalized.length > 0 ? normalized : " ");
  const svgPages = await renderTree(tree);
  const buffers = await Promise.all(svgPages.map((svg) => svgToBuffer(svg, format)));

  return {
    fileBase: getSuggestedFileBase(normalized),
    buffers,
  };
}

export async function createImagesFromMarkdown(markdown: string, format: ImageFormat) {
  const { fileBase, buffers } = await renderMarkdownToImageBuffers(markdown, format);

  if (buffers.length === 1) {
    return {
      filename: `${fileBase}.${format}`,
      mimeType: format === "png" ? "image/png" : "image/jpeg",
      buffer: buffers[0],
    };
  }

  return {
    filename: `${fileBase}-${format}-pages.zip`,
    mimeType: "application/zip",
    buffer: createStoredZip(
      buffers.map((buffer, index) => ({
        name: `${fileBase}-${String(index + 1).padStart(2, "0")}.${format}`,
        data: buffer,
      })),
    ),
  };
}
