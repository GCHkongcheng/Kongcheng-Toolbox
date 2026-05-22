import type {
  Blockquote,
  Code,
  Delete,
  Emphasis,
  Heading,
  InlineCode,
  Link,
  List,
  ListItem,
  PhrasingContent,
  Root,
  Strong,
  Table as MdTable,
  TableCell as MdTableCell,
  Text,
} from "mdast";
import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  LevelFormat,
  Math as DocxMath,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
  type FileChild,
  type IParagraphOptions,
  type IRunOptions,
} from "docx";
import { createDocxMathFromLatex } from "@/lib/ai-export/docx-math";
import { getSuggestedFileBase, parseMarkdown } from "@/lib/ai-export/markdown";

interface InlineMathNode {
  type: "inlineMath";
  value: string;
}

interface MathNode {
  type: "math";
  value: string;
}

interface InlineMarks {
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  code?: boolean;
  link?: string;
}

const PAGE_MARGIN = {
  top: 900,
  right: 900,
  bottom: 900,
  left: 900,
};

const BODY_FONT = "Microsoft YaHei";
const CODE_FONT = "Consolas";
const BODY_COLOR = "1F2937";
const BORDER_COLOR = "D6D3D1";
const CODE_BG = "F8FAFC";
const QUOTE_BG = "FAFAF9";
const HEADER_BG = "F5EFE6";
const LINK_COLOR = "2563EB";
function headingLevel(depth: number) {
  switch (depth) {
    case 1:
      return HeadingLevel.HEADING_1;
    case 2:
      return HeadingLevel.HEADING_2;
    case 3:
      return HeadingLevel.HEADING_3;
    case 4:
      return HeadingLevel.HEADING_4;
    default:
      return HeadingLevel.HEADING_5;
  }
}

function headingSize(depth: number) {
  switch (depth) {
    case 1:
      return 36;
    case 2:
      return 30;
    case 3:
      return 26;
    case 4:
      return 24;
    default:
      return 22;
  }
}

function createTextRun(text: string, marks: InlineMarks = {}) {
  const options: IRunOptions = {
    text,
    bold: marks.bold,
    italics: marks.italic,
    strike: marks.strike,
    color: marks.link ? LINK_COLOR : BODY_COLOR,
    font: marks.code ? CODE_FONT : BODY_FONT,
    size: marks.code ? 21 : 24,
    highlightComplexScript: false,
    shading: marks.code
      ? {
          fill: "F3F4F6",
          color: "auto",
        }
      : undefined,
  };

  return new TextRun(options);
}

async function renderInlineChildren(
  nodes: PhrasingContent[],
  marks: InlineMarks = {},
): Promise<(TextRun | DocxMath | ExternalHyperlink)[]> {
  const output: (TextRun | DocxMath | ExternalHyperlink)[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case "text":
        output.push(createTextRun((node as Text).value, marks));
        break;
      case "strong":
        output.push(
          ...(await renderInlineChildren((node as Strong).children, {
            ...marks,
            bold: true,
          })),
        );
        break;
      case "emphasis":
        output.push(
          ...(await renderInlineChildren((node as Emphasis).children, {
            ...marks,
            italic: true,
          })),
        );
        break;
      case "delete":
        output.push(
          ...(await renderInlineChildren((node as Delete).children, {
            ...marks,
            strike: true,
          })),
        );
        break;
      case "inlineCode":
        output.push(
          createTextRun((node as InlineCode).value, {
            ...marks,
            code: true,
          }),
        );
        break;
      case "inlineMath": {
        output.push(createDocxMathFromLatex((node as InlineMathNode).value));
        break;
      }
      case "break":
        output.push(new TextRun({ break: 1 }));
        break;
      case "link": {
        const link = node as Link;
        const children = await renderInlineChildren(link.children, {
          ...marks,
          link: link.url,
        });
        output.push(
          new ExternalHyperlink({
            link: link.url,
            children,
          }),
        );
        break;
      }
      case "image":
        output.push(createTextRun(`[图片：${node.alt ?? "未命名图片"}]`, marks));
        break;
      default:
        break;
    }
  }

  return output.length > 0 ? output : [createTextRun("")];
}

async function createParagraphFromInline(
  nodes: PhrasingContent[],
  options: IParagraphOptions = {},
) {
  return new Paragraph({
    ...options,
    children: await renderInlineChildren(nodes),
  });
}

async function createHeading(node: Heading) {
  return createParagraphFromInline(node.children, {
    heading: headingLevel(node.depth),
    spacing: {
      before: node.depth === 1 ? 220 : 160,
      after: node.depth === 1 ? 120 : 80,
    },
    thematicBreak: false,
    alignment: AlignmentType.LEFT,
  });
}

async function createMathParagraph(formula: string) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: {
      before: 40,
      after: 72,
    },
    children: [createDocxMathFromLatex(formula)],
  });
}

function createCodeParagraph(line: string, first: boolean, last: boolean) {
  return new Paragraph({
    spacing: {
      before: first ? 120 : 0,
      after: last ? 120 : 0,
      line: 360,
    },
    border: {
      left: { color: BORDER_COLOR, style: BorderStyle.SINGLE, size: 1 },
      right: { color: BORDER_COLOR, style: BorderStyle.SINGLE, size: 1 },
      top: first
        ? { color: BORDER_COLOR, style: BorderStyle.SINGLE, size: 1 }
        : undefined,
      bottom: last
        ? { color: BORDER_COLOR, style: BorderStyle.SINGLE, size: 1 }
        : undefined,
    },
    shading: {
      fill: CODE_BG,
      color: "auto",
    },
    indent: {
      left: 160,
      right: 160,
    },
    children: [
      new TextRun({
        text: line.length > 0 ? line : " ",
        font: CODE_FONT,
        size: 21,
        color: BODY_COLOR,
      }),
    ],
  });
}

async function createBlockquoteParagraphs(node: Blockquote) {
  const paragraphs: Paragraph[] = [];

  for (const child of node.children) {
    if (child.type !== "paragraph") {
      continue;
    }

    paragraphs.push(
      await createParagraphFromInline(child.children, {
        spacing: {
          before: 80,
          after: 80,
          line: 360,
        },
        border: {
          left: { color: BORDER_COLOR, style: BorderStyle.SINGLE, size: 6 },
        },
        shading: {
          fill: QUOTE_BG,
          color: "auto",
        },
        indent: {
          left: 240,
          right: 120,
        },
      }),
    );
  }

  return paragraphs;
}

async function createListParagraphs(list: List, depth = 0): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = [];
  const reference = list.ordered ? "ai-export-number" : "ai-export-bullet";

  for (const item of list.children) {
    paragraphs.push(...(await createListItemParagraphs(item, reference, depth)));
  }

  return paragraphs;
}

async function createListItemParagraphs(
  item: ListItem,
  reference: string,
  depth: number,
) {
  const paragraphs: Paragraph[] = [];
  let attachedNumbering = false;

  for (const child of item.children) {
    if (child.type === "paragraph") {
      paragraphs.push(
        await createParagraphFromInline(child.children, {
          numbering: attachedNumbering
            ? undefined
            : {
                reference,
                level: Math.min(depth, 2),
              },
          spacing: {
            before: 20,
            after: 20,
            line: 360,
          },
        }),
      );
      attachedNumbering = true;
      continue;
    }

    if (child.type === "list") {
      paragraphs.push(...(await createListParagraphs(child, depth + 1)));
      continue;
    }

    if (child.type === "code") {
      const lines = (child.value || " ").split("\n");
      lines.forEach((line, index) => {
        paragraphs.push(
          createCodeParagraph(line, index === 0, index === lines.length - 1),
        );
      });
      continue;
    }

    if (child.type === "blockquote") {
      paragraphs.push(...(await createBlockquoteParagraphs(child)));
    }
  }

  return paragraphs;
}

async function createTableCell(cell: MdTableCell, header = false) {
  return new TableCell({
    shading: header
      ? {
          fill: HEADER_BG,
          color: "auto",
        }
      : undefined,
    margins: {
      top: 120,
      bottom: 120,
      left: 120,
      right: 120,
    },
    children: [
      await createParagraphFromInline(cell.children as PhrasingContent[], {
        spacing: {
          before: 0,
          after: 0,
          line: 320,
        },
      }),
    ],
  });
}

async function createTable(node: MdTable) {
  const rows: TableRow[] = [];

  for (let rowIndex = 0; rowIndex < node.children.length; rowIndex += 1) {
    const row = node.children[rowIndex];
    const header = rowIndex === 0;
    rows.push(
      new TableRow({
        tableHeader: header,
        children: await Promise.all(
          row.children.map((cell) => createTableCell(cell, header)),
        ),
      }),
    );
  }

  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    layout: TableLayoutType.FIXED,
    rows,
    borders: {
      top: { style: BorderStyle.SINGLE, color: BORDER_COLOR, size: 1 },
      bottom: { style: BorderStyle.SINGLE, color: BORDER_COLOR, size: 1 },
      left: { style: BorderStyle.SINGLE, color: BORDER_COLOR, size: 1 },
      right: { style: BorderStyle.SINGLE, color: BORDER_COLOR, size: 1 },
      insideHorizontal: {
        style: BorderStyle.SINGLE,
        color: BORDER_COLOR,
        size: 1,
      },
      insideVertical: {
        style: BorderStyle.SINGLE,
        color: BORDER_COLOR,
        size: 1,
      },
    },
    margins: {
      left: 120,
      right: 120,
    },
  });
}

function createRuleParagraph() {
  return new Paragraph({
    spacing: {
      before: 120,
      after: 120,
    },
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        color: BORDER_COLOR,
        size: 2,
      },
    },
  });
}

async function createBodyChildren(tree: Root): Promise<FileChild[]> {
  const children: FileChild[] = [];

  for (const node of tree.children) {
    switch (node.type) {
      case "heading":
        children.push(await createHeading(node));
        break;
      case "paragraph":
        children.push(
          await createParagraphFromInline(node.children, {
            spacing: {
              before: 40,
              after: 80,
              line: 360,
            },
          }),
        );
        break;
      case "math":
        children.push(await createMathParagraph((node as MathNode).value));
        break;
      case "blockquote":
        children.push(...(await createBlockquoteParagraphs(node)));
        break;
      case "list":
        children.push(...(await createListParagraphs(node)));
        break;
      case "table":
        children.push(await createTable(node));
        children.push(
          new Paragraph({
            spacing: {
              after: 120,
            },
          }),
        );
        break;
      case "code": {
        const lines = ((node as Code).value || " ").split("\n");
        lines.forEach((line, index) => {
          children.push(
            createCodeParagraph(line, index === 0, index === lines.length - 1),
          );
        });
        break;
      }
      case "thematicBreak":
        children.push(createRuleParagraph());
        break;
      default:
        break;
    }
  }

  if (children.length === 0) {
    children.push(
      new Paragraph({
        children: [createTextRun(" ")],
      }),
    );
  }

  return children;
}

export async function createDocxFromMarkdown(markdown: string) {
  const normalized = markdown.trim();
  const title = getSuggestedFileBase(normalized);
  const tree = parseMarkdown(normalized.length > 0 ? normalized : " ");
  const bodyChildren = await createBodyChildren(tree);

  const document = new Document({
    creator: "OpenAI Codex",
    title,
    description: "AI rich export",
    numbering: {
      config: [
        {
          reference: "ai-export-bullet",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: 720,
                    hanging: 220,
                  },
                },
              },
            },
            {
              level: 1,
              format: LevelFormat.BULLET,
              text: "\u25E6",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: 1080,
                    hanging: 220,
                  },
                },
              },
            },
            {
              level: 2,
              format: LevelFormat.BULLET,
              text: "\u25AA",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: 1440,
                    hanging: 220,
                  },
                },
              },
            },
          ],
        },
        {
          reference: "ai-export-number",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: 720,
                    hanging: 260,
                  },
                },
              },
            },
            {
              level: 1,
              format: LevelFormat.DECIMAL,
              text: "%1.%2.",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: 1080,
                    hanging: 320,
                  },
                },
              },
            },
            {
              level: 2,
              format: LevelFormat.DECIMAL,
              text: "%1.%2.%3.",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: 1440,
                    hanging: 380,
                  },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: PAGE_MARGIN,
          },
        },
        children: bodyChildren,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: BODY_FONT,
            size: 24,
            color: BODY_COLOR,
          },
          paragraph: {
            spacing: {
              line: 360,
            },
          },
        },
      },
      paragraphStyles: [
        {
          id: "Heading1Custom",
          name: "Heading1Custom",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            font: BODY_FONT,
            size: headingSize(1),
            bold: true,
            color: BODY_COLOR,
          },
          paragraph: {
            spacing: {
              before: 220,
              after: 120,
            },
          },
        },
      ],
    },
  });

  return {
    filename: `${title}.docx`,
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    buffer: await Packer.toBuffer(document),
  };
}
