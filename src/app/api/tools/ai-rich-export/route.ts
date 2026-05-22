import { NextResponse } from "next/server";
import { createDocxFromMarkdown } from "@/lib/ai-export/docx";
import { createImagesFromMarkdown } from "@/lib/ai-export/image";
import { createPdfFromMarkdown } from "@/lib/ai-export/pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

type ExportFormat = "docx" | "pdf" | "png" | "jpg";

function isExportFormat(value: unknown): value is ExportFormat {
  return (
    value === "docx" ||
    value === "pdf" ||
    value === "png" ||
    value === "jpg"
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const content =
      typeof body?.content === "string" ? body.content.trim() : "";
    const format = body?.format;

    if (!isExportFormat(format)) {
      return NextResponse.json(
        { error: "不支持的导出格式。" },
        { status: 400 },
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: "请输入需要导出的内容。" },
        { status: 400 },
      );
    }

    if (content.length > 200_000) {
      return NextResponse.json(
        { error: "内容过长，请分段导出或缩短到 200,000 字符以内。" },
        { status: 400 },
      );
    }

    const file =
      format === "docx"
        ? await createDocxFromMarkdown(content)
        : format === "pdf"
          ? await createPdfFromMarkdown(content)
          : await createImagesFromMarkdown(content, format);

    const payload = Uint8Array.from(file.buffer);

    return new Response(payload, {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to export markdown:", error);

    return NextResponse.json(
      { error: "导出失败，请稍后重试。" },
      { status: 500 },
    );
  }
}
