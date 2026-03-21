import Link from "next/link";
import { moduleMetas, toolDemos } from "@/lib/tool-modules";
import { ModuleOverviewCard } from "@/components/ui/module-overview-card";
import { ToolOverviewCard } from "@/components/ui/tool-overview-card";

export default function ToolsOverviewPage() {
  return (
    <main className="min-h-screen bg-background text-foreground p-4 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Kongcheng Toolbox
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              空城工具箱 · 模块总览
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              首页
            </Link>
            <a
              href="https://blog.gchkc.top"
              className="hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              博客
            </a>
            <Link href="/about" className="hover:text-foreground">
              关于
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {moduleMetas.map((module) => (
            <ModuleOverviewCard key={module.id} module={module} />
          ))}
        </div>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">工具列表</h2>
            <p className="text-xs text-muted-foreground">
              包含自动注册工具与内置工具
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {toolDemos.map((tool) => (
              <ToolOverviewCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
