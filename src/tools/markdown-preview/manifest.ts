import type { ToolManifest } from "@/lib/tool-manifest";

export const manifest: ToolManifest = {
  id: "markdown-preview",
  module: "docs",
  name: "Markdown 在线预览",
  summary: "实时编辑 Markdown，并在右侧同步预览渲染结果。",
  status: "已上线",
  tags: ["markdown", "preview", "docs"],
};
