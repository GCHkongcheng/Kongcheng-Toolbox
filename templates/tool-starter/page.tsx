"use client";

import { useMemo, useState } from "react";
import { ToolPageShell } from "@/components/ui/tool-page-shell";

function runTool(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  return `处理结果: ${trimmed}`;
}

export default function ToolPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const result = useMemo(() => runTool(input), [input]);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch {
      setError("处理失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolPageShell
      title="工具模板页面"
      subtitle="将本页替换为你的业务界面，保留输入/输出/加载/错误四态。"
      status="开发中"
      maxWidthClassName="max-w-4xl"
    >
      <div className="rounded-xl border border-border bg-card p-5 lg:p-7">
        <section className="mt-5 space-y-3">
          <label className="block text-sm font-medium" htmlFor="tool-input">
            输入
          </label>
          <textarea
            id="tool-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入内容"
            className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="inline-flex rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "处理中..." : "运行"}
          </button>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-semibold">输出</h2>
          {error ? (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          ) : result ? (
            <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-muted p-3 text-sm">
              {result}
            </pre>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">暂无结果</p>
          )}
        </section>
      </div>
    </ToolPageShell>
  );
}
