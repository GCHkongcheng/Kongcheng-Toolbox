"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  moduleMetas,
  promptTemplates,
  toolDemos,
  type ModuleId,
  type PromptTemplate,
} from "@/lib/tool-modules";
import {
  siteLinkGroups,
  type SiteLinkGroup,
  type SiteLinkItem,
} from "../lib/site-links";
import { ToolOverviewCard } from "@/components/ui/tool-overview-card";
import { SiteLinkCard } from "@/components/ui/site-link-card";
import { SidebarWidgets } from "@/components/ui/sidebar-widgets";
import {
  Search,
  Menu,
  X,
  FileText,
  Sparkles,
  Code2,
  PenTool,
  BookOpen,
  LayoutTemplate,
  ChevronRight,
  Copy,
  Star,
  Tag,
  Sun,
  Moon,
  Compass,
} from "lucide-react";

const FAVORITE_STORAGE_KEY = "gchkongcheng.site-favorites";

type SiteViewId = "sites-center" | "sites-favorites";
type ViewId = "all" | ModuleId | SiteViewId;
type SearchEngine = "google" | "github" | "npm" | "dev-search";

const searchEngineOptions: Array<{
  id: SearchEngine;
  label: string;
  buildUrl: (keyword: string) => string;
}> = [
  {
    id: "google",
    label: "Google",
    buildUrl: (keyword) =>
      `https://www.google.com/search?q=${encodeURIComponent(keyword)}`,
  },
  {
    id: "github",
    label: "GitHub",
    buildUrl: (keyword) =>
      `https://github.com/search?q=${encodeURIComponent(keyword)}`,
  },
  {
    id: "npm",
    label: "NPM",
    buildUrl: (keyword) =>
      `https://www.npmjs.com/search?q=${encodeURIComponent(keyword)}`,
  },
  {
    id: "dev-search",
    label: "开发者搜索",
    buildUrl: (keyword) =>
      `https://devv.ai/search?lang=zh&q=${encodeURIComponent(keyword)}`,
  },
];

interface Category {
  id: "all" | ModuleId;
  label: string;
  icon: React.ReactNode;
  count: number;
}

const moduleIcons: Record<ModuleId, React.ReactNode> = {
  prompt: <Sparkles size={16} />,
  writing: <PenTool size={16} />,
  code: <Code2 size={16} />,
  docs: <FileText size={16} />,
  learning: <BookOpen size={16} />,
};

const categories: Category[] = [
  {
    id: "all",
    label: "全部工具",
    icon: <LayoutTemplate size={16} />,
    count: toolDemos.length,
  },
  ...moduleMetas.map((module) => ({
    id: module.id,
    label: module.title,
    icon: moduleIcons[module.id],
    count:
      module.id === "prompt"
        ? promptTemplates.length
        : toolDemos.filter((tool) => tool.category === module.id).length,
  })),
];

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        "bg-secondary text-secondary-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

function TemplateCard({
  template,
  onCopy,
}: {
  template: PromptTemplate;
  onCopy: (id: number) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [starred, setStarred] = useState(template.starred);

  const handleCopy = () => {
    onCopy(template.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-5",
        "transition-shadow duration-200 hover:shadow-md dark:hover:shadow-black/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-card-foreground leading-snug">
          {template.title}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setStarred(!starred)}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              starred
                ? "text-amber-400 hover:text-amber-500"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-label={starred ? "取消收藏" : "收藏"}
          >
            <Star size={15} fill={starred ? "currentColor" : "none"} />
          </button>
          <button
            onClick={handleCopy}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="复制模板"
          >
            {copied ? (
              <span className="text-xs font-medium text-green-500">已复制</span>
            ) : (
              <Copy size={15} />
            )}
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {template.description}
      </p>

      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
        {template.tags.map((tag) => (
          <Badge key={tag}>
            <Tag size={10} className="mr-1" />
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>使用 {template.usageCount} 次</span>
        <button className="flex items-center gap-0.5 font-medium text-primary hover:underline">
          使用此模板 <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ViewId>(() => {
    if (typeof window === "undefined") {
      return "all";
    }

    const view = new URLSearchParams(window.location.search).get("view");
    if (view === "sites-center" || view === "sites-favorites") {
      return view;
    }

    return "all";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [aggregateQuery, setAggregateQuery] = useState("");
  const [searchEngine, setSearchEngine] = useState<SearchEngine>("google");
  const [darkMode, setDarkMode] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const saved = localStorage.getItem(FAVORITE_STORAGE_KEY);
      if (!saved) {
        return [];
      }

      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((id): id is string => typeof id === "string");
    } catch {
      return [];
    }
  });

  const isSitesCenterView = activeCategory === "sites-center";
  const isSitesFavoritesView = activeCategory === "sites-favorites";
  const isSitesView = isSitesCenterView || isSitesFavoritesView;

  const totalSiteCount = useMemo(
    () =>
      siteLinkGroups.reduce(
        (total: number, group: SiteLinkGroup) => total + group.links.length,
        0,
      ),
    [],
  );

  const isModuleCategory = (value: ViewId): value is ModuleId => {
    return moduleMetas.some((module) => module.id === value);
  };

  useEffect(() => {
    localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const filteredTemplates = promptTemplates.filter((t) => {
    const matchCategory =
      activeCategory === "all" || activeCategory === "prompt";
    const matchSearch =
      searchQuery === "" ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchCategory && matchSearch;
  });

  const filteredTools = toolDemos.filter((tool) => {
    const matchCategory =
      activeCategory === "all" ||
      (isModuleCategory(activeCategory) && tool.category === activeCategory);
    const matchSearch =
      searchQuery === "" ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const filteredSiteGroups = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    return siteLinkGroups
      .map((group: SiteLinkGroup) => {
        const links = group.links.filter((link: SiteLinkItem) => {
          if (keyword.length === 0) {
            return true;
          }

          return (
            link.name.toLowerCase().includes(keyword) ||
            link.summary.toLowerCase().includes(keyword) ||
            link.tags.some((tag: string) => tag.toLowerCase().includes(keyword))
          );
        });

        return {
          ...group,
          links,
        };
      })
      .filter((group: SiteLinkGroup) => group.links.length > 0);
  }, [searchQuery]);

  const filteredSiteCount = useMemo(() => {
    return filteredSiteGroups.reduce(
      (total: number, group: SiteLinkGroup) => total + group.links.length,
      0,
    );
  }, [filteredSiteGroups]);

  const favoriteSiteLinks = useMemo(() => {
    const linkMap = new Map(
      filteredSiteGroups
        .flatMap((group: SiteLinkGroup) => group.links)
        .map((link: SiteLinkItem) => [link.id, link]),
    );

    return favoriteIds
      .map((id) => linkMap.get(id))
      .filter((link): link is SiteLinkItem => Boolean(link));
  }, [favoriteIds, filteredSiteGroups]);

  const isPromptView = activeCategory === "prompt";
  const isAllView = activeCategory === "all";

  const handleCopy = (id: number) => {
    const tpl = promptTemplates.find((t) => t.id === id);
    if (tpl) navigator.clipboard.writeText(tpl.description).catch(() => {});
  };

  const toggleSiteFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      return [...prev, id];
    });
  };

  const handleAggregateSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const keyword = aggregateQuery.trim();
    if (!keyword) {
      return;
    }

    const engine = searchEngineOptions.find((item) => item.id === searchEngine);
    if (!engine) {
      return;
    }

    window.open(engine.buildUrl(keyword), "_blank", "noopener,noreferrer");
  };

  const headerTitle = isSitesCenterView
    ? "网址导航中心"
    : isSitesFavoritesView
      ? "我的收藏"
      : (categories.find((c) => c.id === activeCategory)?.label ?? "全部工具");

  const headerSubtitle = isSitesCenterView
    ? "当前功能: 网址导航聚合"
    : isSitesFavoritesView
      ? "当前功能: 我的网址收藏"
      : isPromptView
        ? "当前功能: Prompt 模板管理器 Demo"
        : isAllView
          ? "当前功能: 工具总览"
          : "当前功能: 模块占位 Demo";

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

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
            <Sparkles size={14} className="text-primary-foreground" />
          </div>
          <span className="text-sm font-bold tracking-tight">空城工具箱</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-md p-1 text-muted-foreground hover:text-foreground lg:hidden"
            aria-label="关闭侧边栏"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              placeholder={
                isSitesView
                  ? "搜索网址名称、描述或标签..."
                  : "搜索工具或模板..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    activeCategory === cat.id
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <span className="shrink-0">{cat.icon}</span>
                  <span className="flex-1 text-left">{cat.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {cat.count}
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
                onClick={() => {
                  setActiveCategory("sites-center");
                  setSidebarOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  activeCategory === "sites-center"
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Compass size={16} className="shrink-0" />
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
                onClick={() => {
                  setActiveCategory("sites-favorites");
                  setSidebarOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  activeCategory === "sites-favorites"
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Star size={16} className="shrink-0" />
                <span className="flex-1 text-left">我的收藏</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                    activeCategory === "sites-favorites"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {favoriteIds.length}
                </span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="border-t border-border px-4 py-3 space-y-3">
          <SidebarWidgets />

          <button
            onClick={toggleDark}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span>{darkMode ? "切换浅色模式" : "切换深色模式"}</span>
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground lg:hidden"
            aria-label="打开侧边栏"
          >
            <Menu size={18} />
          </button>

          <div className="flex-1">
            <h1 className="text-sm font-semibold">{headerTitle}</h1>
            <p className="text-xs text-muted-foreground">{headerSubtitle}</p>
          </div>

          <div className="relative hidden md:block">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              placeholder={
                isSitesView
                  ? "搜索网址名称、描述或标签..."
                  : "搜索工具或模板..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-64 rounded-md border border-input bg-muted py-1.5 pl-8 pr-3 text-xs",
                "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-all",
              )}
            />
          </div>

          <button
            onClick={toggleDark}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="切换主题"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/tools"
              className="inline-flex rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              模块总览
            </Link>
            <button
              onClick={() => setActiveCategory("sites-center")}
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

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mb-4 rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
            {isSitesView
              ? "网址导航支持在当前页浏览和收藏，无需离开首页视图。"
              : "空城工具箱是多工具聚合平台，支持按模块浏览与逐步扩展。"}
          </div>

          {isSitesCenterView && (
            <form
              onSubmit={handleAggregateSearch}
              className="mb-4 rounded-lg border border-border bg-card p-2"
            >
              <div className="flex items-center gap-2">
                <select
                  value={searchEngine}
                  onChange={(e) =>
                    setSearchEngine(e.target.value as SearchEngine)
                  }
                  className="rounded-md border border-input bg-background px-2.5 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  aria-label="聚合搜索引擎"
                >
                  {searchEngineOptions.map((engine) => (
                    <option key={engine.id} value={engine.id}>
                      {engine.label}
                    </option>
                  ))}
                </select>

                <input
                  value={aggregateQuery}
                  onChange={(e) => setAggregateQuery(e.target.value)}
                  placeholder="输入关键词并回车，按所选引擎搜索..."
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </form>
          )}

          {isSitesCenterView &&
            (filteredSiteCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Search size={36} className="mb-4 opacity-30" />
                <p className="text-sm font-medium">未找到匹配的网址</p>
                <p className="mt-1 text-xs">尝试更换关键词继续检索</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredSiteGroups.map((group: SiteLinkGroup) => (
                  <section
                    key={group.id}
                    className="rounded-xl border border-border bg-card p-4 lg:p-5"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold tracking-tight">
                          {group.title}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {group.description}
                        </p>
                      </div>
                      <span className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                        {group.links.length}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {group.links.map((link) => (
                        <SiteLinkCard
                          key={link.id}
                          link={link}
                          isFavorite={favoriteIds.includes(link.id)}
                          onToggleFavorite={toggleSiteFavorite}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ))}

          {isSitesFavoritesView &&
            (favoriteSiteLinks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Star size={36} className="mb-4 opacity-30" />
                <p className="text-sm font-medium">还没有收藏的网址</p>
                <p className="mt-1 text-xs">
                  在网址导航中心点击星标即可加入收藏
                </p>
              </div>
            ) : (
              <section className="rounded-xl border border-border bg-card p-4 lg:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold tracking-tight">
                    我的收藏
                  </h2>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                    {favoriteSiteLinks.length}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {favoriteSiteLinks.map((link) => (
                    <SiteLinkCard
                      key={link.id}
                      link={link}
                      isFavorite={favoriteIds.includes(link.id)}
                      onToggleFavorite={toggleSiteFavorite}
                    />
                  ))}
                </div>
              </section>
            ))}

          {!isSitesView && isPromptView && filteredTools.length > 0 && (
            <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTools.map((tool) => (
                <ToolOverviewCard key={tool.id} tool={tool} compact />
              ))}
            </div>
          )}

          {!isSitesView && isPromptView ? (
            filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Search size={36} className="mb-4 opacity-30" />
                <p className="text-sm font-medium">未找到匹配的模板</p>
                <p className="mt-1 text-xs">尝试更换关键词或分类</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredTemplates.map((tpl) => (
                  <TemplateCard
                    key={tpl.id}
                    template={tpl}
                    onCopy={handleCopy}
                  />
                ))}
              </div>
            )
          ) : !isSitesView && filteredTools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <Search size={36} className="mb-4 opacity-30" />
              <p className="text-sm font-medium">未找到匹配的工具</p>
              <p className="mt-1 text-xs">尝试更换关键词或分类</p>
            </div>
          ) : !isSitesView ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTools.map((tool) => (
                <ToolOverviewCard key={tool.id} tool={tool} compact />
              ))}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
