import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import type { ModuleMeta } from "@/lib/tool-modules";
import { StatusBadge } from "@/components/ui/status-badge";

interface ModuleOverviewCardProps {
  module: ModuleMeta;
}

export function ModuleOverviewCard({ module }: ModuleOverviewCardProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold">{module.title}</h2>
        <StatusBadge status={module.status} />
      </div>

      <p className="mt-2 text-sm text-muted-foreground">{module.subtitle}</p>

      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {module.features.slice(0, 3).map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Layers size={14} className="mt-0.5 text-primary" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/tools/${module.id}`}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        进入模块 <ArrowRight size={14} />
      </Link>
    </section>
  );
}
