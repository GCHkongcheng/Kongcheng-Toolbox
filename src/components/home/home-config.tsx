import type { ReactNode } from "react";
import {
  BookOpen,
  Code2,
  Compass,
  FileText,
  LayoutTemplate,
  PenTool,
  Sparkles,
  Star,
} from "lucide-react";
import {
  getModuleMeta,
  moduleIds,
  toolDemos,
  type ModuleId,
} from "@/lib/tool-modules";
import { type HomeViewId } from "@/lib/home-view";

export type SearchEngine = "google" | "github" | "npm" | "dev-search";

export const searchEngineOptions: Array<{
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

export interface Category {
  id: "all" | ModuleId;
  label: string;
  icon: ReactNode;
  count: number;
}

const moduleIcons: Record<ModuleId, ReactNode> = {
  prompt: <Sparkles size={16} />,
  writing: <PenTool size={16} />,
  code: <Code2 size={16} />,
  docs: <FileText size={16} />,
  learning: <BookOpen size={16} />,
};

export const categories: Category[] = [
  {
    id: "all",
    label: "全部工具",
    icon: <LayoutTemplate size={16} />,
    count: toolDemos.length,
  },
  ...moduleIds.map((moduleId) => ({
    id: moduleId,
    label: getModuleMeta(moduleId).title,
    icon: moduleIcons[moduleId],
    count: toolDemos.filter((tool) => tool.category === moduleId).length,
  })),
];

const categoryLabelMap = new Map(
  categories.map((category) => [category.id, category.label]),
);

export function getHomeHeaderCopy(view: HomeViewId) {
  if (view === "sites-center") {
    return {
      title: "网址导航中心",
      subtitle: "当前功能: 网址导航聚合",
    };
  }

  if (view === "sites-favorites") {
    return {
      title: "我的收藏",
      subtitle: "当前功能: 我的网址收藏",
    };
  }

  if (view === "prompt") {
    return {
      title: categoryLabelMap.get(view) ?? "模板管理器",
      subtitle: "当前功能: Prompt 模板管理器 Demo",
    };
  }

  if (view === "all") {
    return {
      title: "全部工具",
      subtitle: "当前功能: 工具总览",
    };
  }

  return {
    title: categoryLabelMap.get(view) ?? "全部工具",
    subtitle: "当前功能: 模块占位 Demo",
  };
}

export const homeNavIcons = {
  logo: <Sparkles size={14} className="text-primary-foreground" />,
  sites: <Compass size={16} className="shrink-0" />,
  favorites: <Star size={16} className="shrink-0" />,
};
