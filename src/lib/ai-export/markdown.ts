import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type {
  Blockquote,
  Code,
  Content,
  Heading,
  InlineCode,
  Link,
  ListItem,
  Paragraph,
  PhrasingContent,
  Root,
  Strong,
  Emphasis,
  Delete,
  TableCell,
  Text,
} from "mdast";
import { normalizeMathMarkdown } from "@/lib/ai-export/math";

interface InlineMathNode {
  type: "inlineMath";
  value: string;
}

type RichInlineNode = PhrasingContent | InlineMathNode;

export interface InlineSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  strike?: boolean;
  link?: string;
}

interface InlineMarks {
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  strike?: boolean;
  link?: string;
}

export function parseMarkdown(markdown: string) {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .parse(normalizeMathMarkdown(markdown)) as Root;
}

export function getSuggestedFileBase(markdown: string) {
  const firstMeaningfulLine = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  const rawTitle = firstMeaningfulLine
    ? firstMeaningfulLine.replace(/^#{1,6}\s+/, "")
    : "ai-export";

  return rawTitle
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 48) || "ai-export";
}

export function flattenInline(nodes: RichInlineNode[]) {
  const output: InlineSegment[] = [];
  const append = (text: string, marks: InlineMarks) => {
    if (!text) {
      return;
    }

    const last = output[output.length - 1];

    if (
      last &&
      last.bold === marks.bold &&
      last.italic === marks.italic &&
      last.code === marks.code &&
      last.strike === marks.strike &&
      last.link === marks.link
    ) {
      last.text += text;
      return;
    }

    output.push({
      text,
      ...marks,
    });
  };

  const visit = (node: RichInlineNode, marks: InlineMarks) => {
    switch (node.type) {
      case "text":
        append((node as Text).value, marks);
        return;
      case "inlineMath":
        append((node as InlineMathNode).value, { ...marks, code: true });
        return;
      case "strong":
        for (const child of (node as Strong).children) {
          visit(child as RichInlineNode, { ...marks, bold: true });
        }
        return;
      case "emphasis":
        for (const child of (node as Emphasis).children) {
          visit(child as RichInlineNode, { ...marks, italic: true });
        }
        return;
      case "delete":
        for (const child of (node as Delete).children) {
          visit(child as RichInlineNode, { ...marks, strike: true });
        }
        return;
      case "inlineCode":
        append((node as InlineCode).value, { ...marks, code: true });
        return;
      case "break":
        append("\n", marks);
        return;
      case "link":
        for (const child of (node as Link).children) {
          visit(child as RichInlineNode, { ...marks, link: (node as Link).url });
        }
        return;
      case "image":
        append(`[图片：${node.alt ?? "未命名图片"}]`, marks);
        return;
      default:
        return;
    }
  };

  for (const node of nodes) {
    visit(node, {});
  }

  return output;
}

export function paragraphSegments(node: Paragraph | Heading | TableCell) {
  return flattenInline(node.children as RichInlineNode[]);
}

export function extractPlainText(nodes: PhrasingContent[]) {
  return flattenInline(nodes)
    .map((segment) => segment.text)
    .join("");
}

export function listItemParagraphs(item: ListItem) {
  return item.children.filter(
    (child): child is Paragraph | Heading | Blockquote | Code =>
      child.type === "paragraph" ||
      child.type === "heading" ||
      child.type === "blockquote" ||
      child.type === "code",
  );
}

export function hasVisibleContent(tree: Root) {
  return tree.children.some((node: Content) => {
    if ("value" in node && typeof node.value === "string") {
      return node.value.trim().length > 0;
    }

    if ("children" in node && Array.isArray(node.children)) {
      return node.children.length > 0;
    }

    return true;
  });
}
