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
  maxWidthClassName = "max-w-none",
  children,
}: ToolPageShellProps) {
  return (
    <main className="min-h-screen bg-background px-4 py-4 text-foreground lg:px-8 lg:py-8 xl:px-10">
      <div className={cn("mx-auto w-full", maxWidthClassName)}>
        <ToolsTopNav backHref={backHref} backLabel={backLabel} />

        <header className="mb-6 flex flex-col gap-4 border-b border-border/70 pb-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Kongcheng Toolbox
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight lg:text-3xl">
              {title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {subtitle}
            </p>
          </div>
          {status ? <StatusBadge status={status} /> : null}
        </header>

        {children}
      </div>
    </main>
  );
}
