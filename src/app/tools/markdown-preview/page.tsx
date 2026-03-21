"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ToolPageShell } from "@/components/ui/tool-page-shell";

const defaultMarkdown = `# Markdown 在线预览

欢迎使用 **空城工具箱** 的 Markdown 预览工具。

## 功能

- 实时编辑
- 即时渲染
- 支持 GFM 表格与任务列表

## 示例表格

| 名称 | 说明 |
| --- | --- |
| 标题 | 使用 # 到 ###### |
| 列表 | 支持有序和无序 |

## 任务列表

- [x] 支持基础 Markdown
- [x] 支持 GFM
- [ ] 支持导出（后续）

> 在左侧输入内容，右侧会实时预览。
`;

export default function MarkdownPreviewPage() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);

  return (
    <ToolPageShell
      title="Markdown 在线预览"
      subtitle="左侧编辑，右侧实时渲染，适合文档草稿和格式校对。"
      status="已上线"
      maxWidthClassName="max-w-7xl"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Markdown 输入</h2>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="mt-3 min-h-[520px] w-full rounded-md border border-input bg-background p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring"
            placeholder="在这里输入 Markdown..."
          />
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">实时预览</h2>
          <div className="mt-3 min-h-[520px] overflow-auto rounded-md border border-border bg-background p-4">
            <div className="markdown-preview">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown || "请输入 Markdown 内容..."}
              </ReactMarkdown>
            </div>
          </div>
        </section>
      </div>
    </ToolPageShell>
  );
}
