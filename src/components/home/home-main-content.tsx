"use client";

import { Search, Star } from "lucide-react";
import { type SiteLinkGroup, type SiteLinkItem } from "@/lib/site-links";
import { type ToolDemo } from "@/lib/tool-modules";
import { type SearchEngine, searchEngineOptions } from "@/components/home/home-config";
import { ToolOverviewCard } from "@/components/ui/tool-overview-card";
import { SiteLinkCard } from "@/components/ui/site-link-card";

interface HomeMainContentProps {
  isSitesView: boolean;
  isSitesCenterView: boolean;
  isSitesFavoritesView: boolean;
  filteredSiteCount: number;
  filteredSiteGroups: SiteLinkGroup[];
  favoriteSiteLinks: SiteLinkItem[];
  favoriteIds: string[];
  filteredTools: ToolDemo[];
  aggregateQuery: string;
  searchEngine: SearchEngine;
  onAggregateQueryChange: (value: string) => void;
  onSearchEngineChange: (value: SearchEngine) => void;
  onToggleFavorite: (id: string) => void;
  onAggregateSearch: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function HomeMainContent({
  isSitesView,
  isSitesCenterView,
  isSitesFavoritesView,
  filteredSiteCount,
  filteredSiteGroups,
  favoriteSiteLinks,
  favoriteIds,
  filteredTools,
  aggregateQuery,
  searchEngine,
  onAggregateQueryChange,
  onSearchEngineChange,
  onToggleFavorite,
  onAggregateSearch,
}: HomeMainContentProps) {
  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
      <div className="mb-4 rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
        {isSitesView
          ? "网址导航支持在当前页浏览和收藏，无需离开首页视图。"
          : "空城工具箱是多工具聚合平台，支持按模块浏览与逐步扩展。"}
      </div>

      {isSitesCenterView && (
        <form
          onSubmit={onAggregateSearch}
          className="mb-4 rounded-lg border border-border bg-card p-2"
        >
          <div className="flex items-center gap-2">
            <select
              value={searchEngine}
              onChange={(e) => onSearchEngineChange(e.target.value as SearchEngine)}
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
              onChange={(e) => onAggregateQueryChange(e.target.value)}
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
            {filteredSiteGroups.map((group) => (
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
                      onToggleFavorite={onToggleFavorite}
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
            <p className="mt-1 text-xs">在网址导航中心点击星标即可加入收藏</p>
          </div>
        ) : (
          <section className="rounded-xl border border-border bg-card p-4 lg:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight">我的收藏</h2>
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
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          </section>
        ))}

      {!isSitesView && filteredTools.length === 0 ? (
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
  );
}
