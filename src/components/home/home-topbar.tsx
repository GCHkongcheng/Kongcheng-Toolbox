"use client";

import Link from "next/link";
import { Menu, Moon, Search, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { type HomeViewId } from "@/lib/home-view";

interface HomeTopbarProps {
  title: string;
  subtitle: string;
  searchQuery: string;
  isSitesView: boolean;
  darkMode: boolean;
  onSearchQueryChange: (value: string) => void;
  onOpenSidebar: () => void;
  onToggleDark: () => void;
  onViewChange: (view: HomeViewId) => void;
}

export function HomeTopbar({
  title,
  subtitle,
  searchQuery,
  isSitesView,
  darkMode,
  onSearchQueryChange,
  onOpenSidebar,
  onToggleDark,
  onViewChange,
}: HomeTopbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 lg:px-6">
      <button
        onClick={onOpenSidebar}
        className="rounded-md p-1.5 text-muted-foreground hover:text-foreground lg:hidden"
        aria-label="打开侧边栏"
      >
        <Menu size={18} />
      </button>

      <div className="flex-1">
        <h1 className="text-sm font-semibold">{title}</h1>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <div className="relative hidden md:block">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder={
            isSitesView ? "搜索网址名称、描述或标签..." : "搜索工具或模板..."
          }
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className={cn(
            "w-64 rounded-md border border-input bg-muted py-1.5 pl-8 pr-3 text-xs",
            "placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all",
          )}
        />
      </div>

      <button
        onClick={onToggleDark}
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="切换主题"
      >
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="hidden items-center gap-2 sm:flex">
        <Link
          href="/tools"
          className="inline-flex rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          模块总览
        </Link>
        <button
          onClick={() => onViewChange("sites-center")}
          className="inline-flex rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          网址导航
        </button>
        <a
          href="https://blog.gchkc.top"
          className="inline-flex rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          target="_blank"
          rel="noopener noreferrer"
        >
          博客
        </a>
        <Link
          href="/about"
          className="inline-flex rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          关于
        </Link>
      </div>
    </header>
  );
}
