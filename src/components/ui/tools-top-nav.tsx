import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface ToolsTopNavProps {
  backHref?: string;
  backLabel?: string;
}

export function ToolsTopNav({ backHref, backLabel }: ToolsTopNavProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
      {backHref && backLabel ? (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft size={16} />
          <span>{backLabel}</span>
        </Link>
      ) : (
        <span className="text-sm text-muted-foreground">空城工具箱</span>
      )}

      <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          首页
        </Link>
        <Link href="/sites" className="transition-colors hover:text-foreground">
          网站导航
        </Link>
        <a
          href="https://blog.gchkc.top"
          className="transition-colors hover:text-foreground"
          target="_blank"
          rel="noopener noreferrer"
        >
          博客
        </a>
        <Link href="/about" className="transition-colors hover:text-foreground">
          关于
        </Link>
      </nav>
    </div>
  );
}
