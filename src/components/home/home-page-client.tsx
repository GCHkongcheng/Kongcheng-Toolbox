"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isModuleId, toolDemos, type ModuleId } from "@/lib/tool-modules";
import { getHomeViewPath, type HomeViewId } from "@/lib/home-view";
import { type SidebarWidgetsData } from "@/lib/sidebar-widgets";
import {
  siteLinkGroups,
  type SiteLinkGroup,
  type SiteLinkItem,
} from "@/lib/site-links";
import {
  getHomeHeaderCopy,
  searchEngineOptions,
  type SearchEngine,
} from "@/components/home/home-config";
import { HomeMainContent } from "@/components/home/home-main-content";
import { HomeSidebar } from "@/components/home/home-sidebar";
import { HomeTopbar } from "@/components/home/home-topbar";

const FAVORITE_STORAGE_KEY = "gchkongcheng.site-favorites";

interface HomePageClientProps {
  initialView: HomeViewId;
  initialWidgetsData: SidebarWidgetsData | null;
}

export function HomePageClient({
  initialView,
  initialWidgetsData,
}: HomePageClientProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<HomeViewId>(initialView);
  const [searchQuery, setSearchQuery] = useState("");
  const [aggregateQuery, setAggregateQuery] = useState("");
  const [searchEngine, setSearchEngine] = useState<SearchEngine>("google");
  const [darkMode, setDarkMode] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoritesReady, setFavoritesReady] = useState(false);

  useEffect(() => {
    setActiveCategory(initialView);
  }, [initialView]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FAVORITE_STORAGE_KEY);
      if (!saved) {
        setFavoritesReady(true);
        return;
      }

      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) {
        setFavoriteIds([]);
        setFavoritesReady(true);
        return;
      }

      setFavoriteIds(
        parsed.filter((id): id is string => typeof id === "string"),
      );
      setFavoritesReady(true);
    } catch {
      setFavoriteIds([]);
      setFavoritesReady(true);
    }
  }, []);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    if (!favoritesReady) {
      return;
    }

    localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds, favoritesReady]);

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

  const isModuleCategory = (value: HomeViewId): value is ModuleId => {
    return isModuleId(value);
  };

  const updateView = (nextView: HomeViewId) => {
    setActiveCategory(nextView);
    setSidebarOpen(false);
    router.push(getHomeViewPath(nextView), { scroll: false });
  };

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

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

  const toggleSiteFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      return [...prev, id];
    });
  };

  const handleAggregateSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

  const { title, subtitle } = getHomeHeaderCopy(activeCategory);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <HomeSidebar
        sidebarOpen={sidebarOpen}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        isSitesView={isSitesView}
        totalSiteCount={totalSiteCount}
        favoriteCount={favoriteIds.length}
        darkMode={darkMode}
        initialWidgetsData={initialWidgetsData}
        onClose={() => setSidebarOpen(false)}
        onSearchQueryChange={setSearchQuery}
        onViewChange={updateView}
        onToggleDark={toggleDark}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <HomeTopbar
          title={title}
          subtitle={subtitle}
          searchQuery={searchQuery}
          isSitesView={isSitesView}
          darkMode={darkMode}
          onSearchQueryChange={setSearchQuery}
          onOpenSidebar={() => setSidebarOpen(true)}
          onToggleDark={toggleDark}
          onViewChange={updateView}
        />

        <HomeMainContent
          isSitesView={isSitesView}
          isSitesCenterView={isSitesCenterView}
          isSitesFavoritesView={isSitesFavoritesView}
          filteredSiteCount={filteredSiteCount}
          filteredSiteGroups={filteredSiteGroups}
          favoriteSiteLinks={favoriteSiteLinks}
          favoriteIds={favoriteIds}
          filteredTools={filteredTools}
          aggregateQuery={aggregateQuery}
          searchEngine={searchEngine}
          onAggregateQueryChange={setAggregateQuery}
          onSearchEngineChange={setSearchEngine}
          onToggleFavorite={toggleSiteFavorite}
          onAggregateSearch={handleAggregateSearch}
        />
      </div>
    </div>
  );
}
