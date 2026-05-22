import type { ReactNode } from "react";
import type { ToolStatus } from "@/lib/tool-manifest";
import { cn } from "@/lib/utils";
import { ToolsTopNav } from "@/components/ui/tools-top-nav";
import { StatusBadge } from "@/components/ui/status-badge";

interface ToolPageShellProps {
  title: string;
  subtitle: string;
  status?: ToolStatus;
  backHref?: string;
  backLabel?: string;
  maxWidthClassName?: string;
  children: ReactNode;
}

export function ToolPageShell({
  title,
  subtitle,
  status,
  backHref = "/",
  backLabel = "返回空城工具箱",
  maxWidthClassName = "max-w-7xl",
  children,
}: ToolPageShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground p-4 lg:p-8">
      <div className={cn("mx-auto", maxWidthClassName)}>
        <ToolsTopNav backHref={backHref} backLabel={backLabel} />

        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Kongcheng Toolbox
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {status ? <StatusBadge status={status} /> : null}
        </header>

        {children}
      </div>
    </main>
  );
}
