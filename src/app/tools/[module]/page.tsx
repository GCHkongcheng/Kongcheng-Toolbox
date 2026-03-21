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
