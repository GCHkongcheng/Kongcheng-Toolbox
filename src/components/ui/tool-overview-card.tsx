import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { moduleMetas, type ToolDemo } from "@/lib/tool-modules";
import { StatusBadge } from "@/components/ui/status-badge";

interface ToolOverviewCardProps {
  tool: ToolDemo;
  compact?: boolean;
}

export function ToolOverviewCard({
  tool,
  compact = false,
}: ToolOverviewCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card",
        compact ? "p-4" : "p-5",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className={cn("font-semibold", compact ? "text-sm" : "text-base")}>
          {tool.name}
        </h3>
        <StatusBadge status={tool.status} />
      </div>

      <p
        className={cn(
          "mt-2 text-muted-foreground",
          compact ? "text-xs" : "text-sm",
        )}
      >
        {tool.summary}
      </p>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Wrench size={13} className="text-primary" />
        <span>
          所属模块：{moduleMetas.find((m) => m.id === tool.category)?.title}
        </span>
      </div>

      <Link
        href={tool.path ?? `/tools/${tool.category}`}
        className={cn(
          "mt-4 inline-flex items-center gap-1 font-medium text-primary hover:underline",
          compact ? "text-xs" : "text-sm",
        )}
      >
        进入工具 <ArrowRight size={14} />
      </Link>
    </section>
  );
}
