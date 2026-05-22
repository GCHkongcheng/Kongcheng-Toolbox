import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Wrench, Sparkles } from "lucide-react";
import { moduleIds, moduleMap, type ModuleId } from "@/lib/tool-modules";
import { modulePageConfigs } from "@/lib/tool-module-pages";
import { ToolPageShell } from "@/components/ui/tool-page-shell";

export function generateStaticParams() {
  return moduleIds.map((module) => ({ module }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string }>;
}): Promise<Metadata> {
  const { module } = await params;
  const meta = moduleMap[module as ModuleId];

  if (!meta) {
    return {};
  }

  return {
    title: meta.title,
    description: meta.subtitle,
    alternates: {
      canonical: `/tools/${meta.id}`,
    },
  };
}

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

  const pageConfig = modulePageConfigs[module as ModuleId];

  if (pageConfig?.embedded) {
    return (
      <ToolPageShell
        title={meta.title}
        subtitle={pageConfig.embedded.subtitle}
        status={meta.status}
        maxWidthClassName="max-w-6xl"
      >
        <section className="rounded-xl border border-border bg-card p-4 lg:p-5">
          <h2 className="text-sm font-semibold text-foreground">模块功能</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageConfig.embedded.cards.map((card) => (
              <div
                key={card.title}
                className="rounded-lg border border-border bg-background p-3"
              >
                <p className="text-sm font-medium">{card.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-border bg-card p-3 lg:p-4">
          <div className="mb-3 text-xs text-muted-foreground">
            若内嵌失败，可直接访问：
            <a
              href={pageConfig.embedded.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 font-medium text-primary hover:underline"
            >
              {pageConfig.embedded.externalUrl.replace(/^https?:\/\//, "")}
            </a>
          </div>

          <iframe
            title={pageConfig.embedded.embedTitle}
            src={pageConfig.embedded.embedUrl}
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
            {pageConfig?.placeholder?.statusNote ??
              "当前页面为二级模块占位 Demo，用于先打通“工具聚合首页 → 模块详情页”的导航链路。后续可按模块接入真实交互与接口。"}
          </p>
        </div>
      </section>
    </ToolPageShell>
  );
}
