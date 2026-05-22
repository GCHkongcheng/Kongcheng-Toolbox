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
  maxWidthClassName = "max-w-6xl",
  children,
}: SitePageShellProps) {
  return (
    <main className="min-h-screen bg-background p-4 text-foreground lg:p-8">
      <div className={cn("mx-auto", maxWidthClassName)}>
        <ToolsTopNav />

        <header className="mb-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Kongcheng Toolbox
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </header>

        {children}
      </div>
    </main>
  );
}
