import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface ToolsTopNavProps {
  backHref?: string;
  backLabel?: string;
}

export function ToolsTopNav({ backHref, backLabel }: ToolsTopNavProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      {backHref && backLabel ? (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={16} /> {backLabel}
        </Link>
      ) : (
        <span className="text-sm text-muted-foreground">空城工具箱</span>
      )}

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Link href="/tools" className="hover:text-foreground">
          模块总览
        </Link>
        <Link href="/sites" className="hover:text-foreground">
          网址导航
        </Link>
        <a
          href="https://blog.gchkc.top"
          className="hover:text-foreground"
          target="_blank"
          rel="noopener noreferrer"
        >
          博客
        </a>
        <Link href="/about" className="hover:text-foreground">
          关于
        </Link>
      </div>
    </div>
  );
}
