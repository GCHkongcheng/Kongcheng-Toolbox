import type { ToolManifest } from "@/lib/tool-manifest";

export const manifest: ToolManifest = {
  id: "ai-rich-export",
  module: "docs",
  name: "AI 内容导出器",
  summary:
    "把 AI 输出内容粘贴到网页中，导出为保留结构的 Word 文档或自动分页图片。",
  status: "已上线",
  tags: ["markdown", "docx", "image", "export"],
};
