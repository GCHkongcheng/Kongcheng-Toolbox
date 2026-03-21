"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  moduleMetas,
  promptTemplates,
  toolDemos,
  type ModuleId,
  type PromptTemplate,
} from "@/lib/tool-modules";
import { ToolOverviewCard } from "@/components/ui/tool-overview-card";
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
} from "lucide-react";

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
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);

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
      activeCategory === "all" || tool.category === activeCategory;
    const matchSearch =
      searchQuery === "" ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const isPromptView = activeCategory === "prompt";
  const isAllView = activeCategory === "all";

  const handleCopy = (id: number) => {
    const tpl = promptTemplates.find((t) => t.id === id);
    if (tpl) navigator.clipboard.writeText(tpl.description).catch(() => {});
  };

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
              placeholder="搜索工具或模板..."
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
        </nav>

        <div className="border-t border-border px-4 py-3">
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
            <h1 className="text-sm font-semibold">
              {categories.find((c) => c.id === activeCategory)?.label ??
                "全部工具"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isPromptView
                ? "当前功能: Prompt 模板管理器 Demo"
                : isAllView
                  ? "当前功能: 工具总览"
                  : "当前功能: 模块占位 Demo"}
            </p>
          </div>

          <div className="relative hidden md:block">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              placeholder="搜索工具或模板..."
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
            空城工具箱是多工具聚合平台，支持按模块浏览与逐步扩展。
          </div>

          {isPromptView && filteredTools.length > 0 && (
            <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTools.map((tool) => (
                <ToolOverviewCard key={tool.id} tool={tool} compact />
              ))}
            </div>
          )}

          {isPromptView ? (
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
          ) : filteredTools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <Search size={36} className="mb-4 opacity-30" />
              <p className="text-sm font-medium">未找到匹配的工具</p>
              <p className="mt-1 text-xs">尝试更换关键词或分类</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTools.map((tool) => (
                <ToolOverviewCard key={tool.id} tool={tool} compact />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
