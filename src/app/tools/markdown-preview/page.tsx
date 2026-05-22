"use client";

import { useMemo, useState } from "react";
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
  const stats = useMemo(() => {
    const lines = markdown.split(/\r?\n/).length;
    const characters = markdown.length;

    return { lines, characters };
  }, [markdown]);

  return (
    <ToolPageShell
      title="Markdown 在线预览"
      subtitle="左侧编辑，右侧实时渲染，适合文档草稿和格式校对。"
      status="已上线"
      maxWidthClassName="max-w-none"
    >
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] 2xl:grid-cols-[minmax(760px,1fr)_minmax(760px,1fr)]">
        <section className="rounded-[28px] border border-border bg-card/95 p-5 shadow-sm lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Markdown 输入
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                适合编写文档草稿、检查结构，或快速校对 Markdown 格式。
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background px-3 py-1.5 text-right text-xs text-muted-foreground">
              <div>
                {stats.characters.toLocaleString()} 字符 / {stats.lines} 行
              </div>
              <div className="mt-1 text-[11px]">支持 GFM 表格和任务列表</div>
            </div>
          </div>

          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="mt-4 min-h-[620px] w-full rounded-[22px] border border-input bg-background p-4 text-sm leading-7 outline-none focus:ring-2 focus:ring-ring 2xl:min-h-[700px]"
            placeholder="在这里输入 Markdown..."
          />

          <div className="mt-3 rounded-[18px] border border-border bg-background/70 px-4 py-3 text-xs leading-5 text-muted-foreground">
            右侧会同步预览，适合在大屏下边编辑边检查表格、列表和段落宽度。
          </div>
        </section>

        <section className="rounded-[28px] border border-border bg-card/95 p-5 shadow-sm lg:sticky lg:top-6 lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">实时预览</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                保持较宽的预览面板，方便在全屏状态下检查内容排版效果。
              </p>
            </div>
            <div className="rounded-full bg-background px-3 py-1 text-xs text-muted-foreground">
              Live Preview
            </div>
          </div>

          <div className="mt-4 min-h-[620px] overflow-auto rounded-[22px] border border-border bg-background p-5 2xl:min-h-[700px]">
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
