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
  headerActions?: ReactNode;
  maxWidthClassName?: string;
  children: ReactNode;
}

export function ToolPageShell({
  title,
  subtitle,
  status,
  backHref = "/",
  backLabel = "返回空城工具箱",
  headerActions,
  maxWidthClassName = "max-w-none",
  children,
}: ToolPageShellProps) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background px-3 py-3 text-foreground sm:px-4 sm:py-4 lg:px-8 lg:py-8 xl:px-10">
      <div className={cn("mx-auto w-full", maxWidthClassName)}>
        <ToolsTopNav backHref={backHref} backLabel={backLabel} />

        <header className="mb-4 flex flex-col gap-4 border-b border-border/70 pb-4 sm:mb-6 sm:pb-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Kongcheng Toolbox
            </p>
            <h1 className="mt-2 text-[1.7rem] font-bold leading-tight tracking-tight sm:text-2xl lg:text-3xl">
              {title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {subtitle}
            </p>
          </div>
          {status || headerActions ? (
            <div className="flex w-full max-w-full flex-col items-start gap-3 md:w-auto md:items-end">
              {status ? <StatusBadge status={status} /> : null}
              {headerActions}
            </div>
          ) : null}
        </header>

        {children}
      </div>
    </main>
  );
}
