"use client";

import { Moon, Search, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { type HomeViewId } from "@/lib/home-view";
import { type SidebarWidgetsData } from "@/lib/sidebar-widgets";
import { SidebarWidgets } from "@/components/ui/sidebar-widgets";
import { categories, homeNavIcons } from "@/components/home/home-config";

interface HomeSidebarProps {
  sidebarOpen: boolean;
  activeCategory: HomeViewId;
  searchQuery: string;
  isSitesView: boolean;
  totalSiteCount: number;
  favoriteCount: number;
  darkMode: boolean;
  initialWidgetsData: SidebarWidgetsData | null;
  onClose: () => void;
  onSearchQueryChange: (value: string) => void;
  onViewChange: (view: HomeViewId) => void;
  onToggleDark: () => void;
}

export function HomeSidebar({
  sidebarOpen,
  activeCategory,
  searchQuery,
  isSitesView,
  totalSiteCount,
  favoriteCount,
  darkMode,
  initialWidgetsData,
  onClose,
  onSearchQueryChange,
  onViewChange,
  onToggleDark,
}: HomeSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-sidebar-bg",
        "transition-transform duration-300 ease-in-out",
        "lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          {homeNavIcons.logo}
        </div>
        <span className="text-sm font-bold tracking-tight">空城工具箱</span>
        <button
          onClick={onClose}
          className="ml-auto rounded-md p-1 text-muted-foreground hover:text-foreground lg:hidden"
          aria-label="关闭侧边栏"
        >
          <X size={16} />
        </button>
      </div>

      <div className="px-4 pb-2 pt-4">
        <div className="relative">
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
              "w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-3 text-xs",
              "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
            )}
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          功能模块
        </p>
        <ul className="space-y-0.5">
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => onViewChange(category.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  activeCategory === category.id
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <span className="shrink-0">{category.icon}</span>
                <span className="flex-1 text-left">{category.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                    activeCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {category.count}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <p className="mb-1.5 mt-5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          网址导航
        </p>
        <ul className="space-y-0.5">
          <li>
            <button
              onClick={() => onViewChange("sites-center")}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                activeCategory === "sites-center"
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {homeNavIcons.sites}
              <span className="flex-1 text-left">网址导航中心</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                  activeCategory === "sites-center"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {totalSiteCount}
              </span>
            </button>
          </li>
          <li>
            <button
              onClick={() => onViewChange("sites-favorites")}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                activeCategory === "sites-favorites"
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {homeNavIcons.favorites}
              <span className="flex-1 text-left">我的收藏</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                  activeCategory === "sites-favorites"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {favoriteCount}
              </span>
            </button>
          </li>
        </ul>
      </nav>

      <div className="space-y-3 border-t border-border px-4 py-3">
        <SidebarWidgets initialData={initialWidgetsData} />

        <button
          onClick={onToggleDark}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          <span>{darkMode ? "切换浅色模式" : "切换深色模式"}</span>
        </button>
      </div>
    </aside>
  );
}
