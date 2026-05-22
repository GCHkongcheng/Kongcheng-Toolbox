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
  ListItem,
  Paragraph,
  PhrasingContent,
  Strong,
  Table,
  TableCell,
  Text,
} from "mdast";
import { getSuggestedFileBase, parseMarkdown } from "@/lib/ai-export/markdown";
import { renderFormulaAsset } from "@/lib/ai-export/math-render";

interface InlineMathNode {
  type: "inlineMath";
  value: string;
}

interface MathNode {
  type: "math";
  value: string;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replaceAll("\n", " ");
}

function normalizeText(value: string) {
  return value.replaceAll("\r\n", "\n");
}

async function renderInlineNode(node: PhrasingContent): Promise<string> {
  switch (node.type) {
    case "text":
      return escapeHtml((node as Text).value);
    case "strong":
      return `<strong>${await renderInlineNodes((node as Strong).children)}</strong>`;
    case "emphasis":
      return `<em>${await renderInlineNodes((node as Emphasis).children)}</em>`;
    case "delete":
      return `<del>${await renderInlineNodes((node as Delete).children)}</del>`;
    case "inlineCode":
      return `<code>${escapeHtml((node as InlineCode).value)}</code>`;
    case "inlineMath": {
      const asset = await renderFormulaAsset((node as InlineMathNode).value, false);
      return `<img class="math-inline" src="${asset.dataUri}" alt="${escapeAttribute(
        (node as InlineMathNode).value,
      )}" width="${asset.width}" height="${asset.height}" />`;
    }
    case "break":
      return "<br />";
    case "link": {
      const link = node as Link;
      return `<a href="${escapeAttribute(link.url)}">${await renderInlineNodes(
        link.children,
      )}</a>`;
    }
    case "image":
      return `<span class="image-placeholder">[图片：${escapeHtml(
        node.alt ?? "未命名图片",
      )}]</span>`;
    default:
      return "";
  }
}

async function renderInlineNodes(nodes: PhrasingContent[]) {
  const parts = await Promise.all(nodes.map((node) => renderInlineNode(node)));
  return parts.join("");
}

async function renderTableCell(tagName: "th" | "td", cell: TableCell) {
  const content = await renderBlockChildren(cell.children as Content[], "compact");
  return `<${tagName}>${content || "&nbsp;"}</${tagName}>`;
}

async function renderListItemNode(item: ListItem) {
  const body = await renderBlockChildren(item.children as Content[], "default");
  return `<li>${body || "<p>&nbsp;</p>"}</li>`;
}

async function renderBlockNode(
  node: Content,
  density: "default" | "compact" = "default",
): Promise<string> {
  switch (node.type) {
    case "heading": {
      const heading = node as Heading;
      return `<h${heading.depth}>${await renderInlineNodes(
        heading.children,
      )}</h${heading.depth}>`;
    }
    case "paragraph":
      return `<p>${await renderInlineNodes((node as Paragraph).children)}</p>`;
    case "blockquote": {
      const quote = node as Blockquote;
      return `<blockquote>${await renderBlockChildren(
        quote.children as Content[],
        "default",
      )}</blockquote>`;
    }
    case "list": {
      const list = node as List;
      const tagName = list.ordered ? "ol" : "ul";
      const startAttr =
        list.ordered && typeof list.start === "number" && list.start !== 1
          ? ` start="${list.start}"`
          : "";
      const items = await Promise.all(
        list.children.map((item) => renderListItemNode(item)),
      );
      return `<${tagName}${startAttr}>${items.join("")}</${tagName}>`;
    }
    case "table": {
      const table = node as Table;
      const [headerRow, ...bodyRows] = table.children;
      const header = headerRow
        ? `<thead><tr>${(
            await Promise.all(
              headerRow.children.map((cell) => renderTableCell("th", cell)),
            )
          ).join("")}</tr></thead>`
        : "";
      const body = bodyRows.length
        ? `<tbody>${(
            await Promise.all(
              bodyRows.map(async (row) => {
                const cells = await Promise.all(
                  row.children.map((cell) => renderTableCell("td", cell)),
                );
                return `<tr>${cells.join("")}</tr>`;
              }),
            )
          ).join("")}</tbody>`
        : "";
      return `<table>${header}${body}</table>`;
    }
    case "code": {
      const code = node as Code;
      const languageClass = code.lang
        ? ` class="language-${escapeAttribute(code.lang)}"`
        : "";
      return `<pre><code${languageClass}>${escapeHtml(
        normalizeText(code.value || ""),
      )}</code></pre>`;
    }
    case "math": {
      const asset = await renderFormulaAsset((node as MathNode).value, true);
      return `<div class="math-block"><img src="${asset.dataUri}" alt="${escapeAttribute(
        (node as MathNode).value,
      )}" width="${asset.width}" height="${asset.height}" /></div>`;
    }
    case "thematicBreak":
      return "<hr />";
    default:
      return density === "compact" ? "" : "<p></p>";
  }
}

async function renderBlockChildren(
  nodes: Content[],
  density: "default" | "compact",
) {
  const parts = await Promise.all(
    nodes.map((node) => renderBlockNode(node, density)),
  );
  return parts.join("");
}

export async function renderMarkdownToExportHtml(markdown: string) {
  const normalized = markdown.trim();
  const title = getSuggestedFileBase(normalized);
  const tree = parseMarkdown(normalized.length > 0 ? normalized : " ");
  const body = await renderBlockChildren(tree.children, "default");

  return {
    title,
    bodyHtml: body || "<p>&nbsp;</p>",
  };
}

export function buildExportDocumentHtml(bodyHtml: string) {
  return `<!DOCTYPE html>
  <html lang="zh-CN">
    <head>
      <meta charset="utf-8" />
      ${buildExportStyleTag()}
    </head>
    <body>
      <div class="export-content">${bodyHtml}</div>
    </body>
  </html>`;
}

export function buildExportXhtmlFragment(bodyHtml: string) {
  return `
    <div xmlns="http://www.w3.org/1999/xhtml">
      ${buildExportStyleTag()}
      <div class="export-content">${bodyHtml}</div>
    </div>
  `;
}

function buildExportStyleTag() {
  return `<style>
        :root { color-scheme: light; }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          color: #111827;
          font-family: "PingFang SC", "Microsoft YaHei UI", "Noto Sans SC", "Segoe UI", Arial, sans-serif;
          background: transparent;
        }
        .export-content {
          width: 1056px;
          padding: 0;
          margin: 0;
          color: #111827;
          font-size: 16px;
          line-height: 1.75;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .export-content h1,
        .export-content h2,
        .export-content h3,
        .export-content h4,
        .export-content h5,
        .export-content h6 {
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
          line-height: 1.3;
        }
        .export-content h1 { font-size: 1.5rem; }
        .export-content h2 { font-size: 1.25rem; }
        .export-content h3 { font-size: 1.125rem; }
        .export-content p {
          margin: 0.5rem 0;
          line-height: 1.7;
        }
        .export-content ul,
        .export-content ol {
          margin: 0.6rem 0;
          padding-left: 1.35rem;
        }
        .export-content li {
          margin: 0.25rem 0;
        }
        .export-content li > p:first-child { margin-top: 0; }
        .export-content li > p:last-child { margin-bottom: 0; }
        .export-content blockquote {
          margin: 0.75rem 0;
          border-left: 3px solid #d6d3d1;
          padding: 0.8rem 0.75rem;
          color: #6b7280;
          background: #fafaf9;
          border-radius: 0.75rem;
        }
        .export-content code {
          border: 1px solid #e5e7eb;
          border-radius: 0.25rem;
          background: #f3f4f6;
          padding: 0.1rem 0.3rem;
          font-size: 0.85em;
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Monaco, monospace;
        }
        .export-content pre {
          margin: 0.75rem 0;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          border-radius: 0.9rem;
          background: #f8fafc;
          padding: 0.75rem;
          white-space: pre-wrap;
        }
        .export-content pre code {
          border: 0;
          border-radius: 0;
          background: transparent;
          padding: 0;
          display: block;
          white-space: pre-wrap;
        }
        .export-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.75rem 0;
          table-layout: fixed;
        }
        .export-content th,
        .export-content td {
          border: 1px solid #d6d3d1;
          padding: 0.45rem 0.55rem;
          text-align: left;
          vertical-align: top;
        }
        .export-content th { background: #f5efe6; }
        .export-content hr {
          margin: 1rem 0;
          border: 0;
          border-top: 1px solid #e5e7eb;
        }
        .export-content a {
          color: #2563eb;
          text-decoration: underline;
        }
        .export-content .math-inline {
          display: inline-block;
          vertical-align: middle;
          margin: 0 0.12rem;
        }
        .export-content .math-block {
          margin: 1rem 0;
          text-align: center;
        }
        .export-content .math-block img {
          max-width: 100%;
        }
      </style>`;
}
