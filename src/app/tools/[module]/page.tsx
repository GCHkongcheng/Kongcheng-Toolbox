import { notFound } from "next/navigation";
import { Wrench, Sparkles } from "lucide-react";
import { moduleMap, type ModuleId } from "@/lib/tool-modules";
import { ToolPageShell } from "@/components/ui/tool-page-shell";

export default async function ToolModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const meta = moduleMap[module as ModuleId];

  if (!meta) {
    notFound();
  }

  if (module === "prompt") {
    return (
      <ToolPageShell
        title={meta.title}
        subtitle="已接入独立站点，支持在当前页面直接访问。"
        status={meta.status}
        maxWidthClassName="max-w-6xl"
      >
        <section className="rounded-xl border border-border bg-card p-4 lg:p-5">
          <h2 className="text-sm font-semibold text-foreground">模块功能</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-sm font-medium">Prompt 模板管理器</p>
              <p className="mt-1 text-xs text-muted-foreground">
                已上线，支持模板检索、标签筛选和快速复用。
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-sm font-medium">变量模板工坊</p>
              <p className="mt-1 text-xs text-muted-foreground">
                开发中，用于变量占位与批量生成场景。
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-sm font-medium">团队模板库</p>
              <p className="mt-1 text-xs text-muted-foreground">
                规划中，支持团队共享、审核与版本管理。
              </p>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-border bg-card p-3 lg:p-4">
          <div className="mb-3 text-xs text-muted-foreground">
            若内嵌失败，可直接访问：
            <a
              href="https://prompt.283947.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 font-medium text-primary hover:underline"
            >
              prompt.283947.xyz
            </a>
          </div>

          <iframe
            title="Prompt 模板管理器"
            src="https://prompt.283947.xyz"
            className="h-[78vh] w-full rounded-lg border border-border bg-background"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      </ToolPageShell>
    );
  }

  return (
    <ToolPageShell
      title={meta.title}
      subtitle={meta.subtitle}
      status={meta.status}
      maxWidthClassName="max-w-5xl"
    >
      <section className="rounded-xl border border-border bg-card p-5 lg:p-7">
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {meta.features.map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-2 rounded-lg border border-border bg-background p-3 text-sm"
            >
              <Sparkles size={14} className="text-primary" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Wrench size={16} /> 模块状态说明
          </div>
          <p className="mt-2 leading-relaxed">
            当前页面为二级模块占位 Demo，用于先打通“工具聚合首页 →
            模块详情页”的导航链路。 后续可按模块接入真实交互与接口。
          </p>
        </div>
      </section>
    </ToolPageShell>
  );
}
