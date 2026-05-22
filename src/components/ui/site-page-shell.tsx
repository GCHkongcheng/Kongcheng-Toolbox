import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ToolsTopNav } from "@/components/ui/tools-top-nav";

interface SitePageShellProps {
  title: string;
  description?: string;
  maxWidthClassName?: string;
  children: ReactNode;
}

export function SitePageShell({
  title,
  description,
  maxWidthClassName = "max-w-none",
  children,
}: SitePageShellProps) {
  return (
    <main className="min-h-screen bg-background px-4 py-4 text-foreground lg:px-8 lg:py-8 xl:px-10">
      <div className={cn("mx-auto w-full", maxWidthClassName)}>
        <ToolsTopNav />

        <header className="mb-6 border-b border-border/70 pb-6">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Kongcheng Toolbox
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight lg:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </header>

        {children}
      </div>
    </main>
  );
}
