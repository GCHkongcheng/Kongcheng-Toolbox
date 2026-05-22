import type { Metadata } from "next";
import { moduleMetas, toolDemos } from "@/lib/tool-modules";
import { ModuleOverviewCard } from "@/components/ui/module-overview-card";
import { SitePageShell } from "@/components/ui/site-page-shell";
import { ToolOverviewCard } from "@/components/ui/tool-overview-card";

export const metadata: Metadata = {
  title: "模块总览",
  description: "查看空城工具箱的模块布局、已上线工具与开发中的能力。",
};

export default function ToolsOverviewPage() {
  return (
    <SitePageShell
      title="空城工具箱 · 模块总览"
      maxWidthClassName="max-w-none"
    >
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
    </SitePageShell>
  );
}
