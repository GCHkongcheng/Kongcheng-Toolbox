import siteLinksJson from "@/data/site-links.json";

type SiteLinkStatus = "推荐" | "常用" | "收录中";

interface RawSiteLinkItem {
  id: string;
  name: string;
  href: string;
  summary: string;
  tags?: string[];
  status?: SiteLinkStatus;
  featured?: boolean;
  weight?: number;
  updatedAt?: string;
  iconApi?: "google" | "duckduckgo";
}

interface RawSiteLinkGroup {
  id: string;
  title: string;
  description: string;
  links: RawSiteLinkItem[];
}

export interface SiteLinkItem {
  id: string;
  name: string;
  href: string;
  summary: string;
  tags: string[];
  status: SiteLinkStatus;
  featured: boolean;
  weight: number;
  updatedAt: string;
  iconUrl: string;
}

export interface SiteLinkGroup {
  id: string;
  title: string;
  description: string;
  links: SiteLinkItem[];
}

function getHostFromHref(href: string) {
  try {
    return new URL(href).hostname;
  } catch {
    return "";
  }
}

export function getSiteIconUrl(
  href: string,
  iconApi: RawSiteLinkItem["iconApi"] = "google",
) {
  const host = getHostFromHref(href);
  if (!host) {
    return "";
  }

  if (iconApi === "duckduckgo") {
    return `https://icons.duckduckgo.com/ip3/${host}.ico`;
  }

  return `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(host)}`;
}

function normalizeSiteLink(link: RawSiteLinkItem): SiteLinkItem {
  return {
    id: link.id,
    name: link.name,
    href: link.href,
    summary: link.summary,
    tags: Array.isArray(link.tags) ? link.tags : [],
    status: link.status ?? "常用",
    featured: Boolean(link.featured),
    weight: typeof link.weight === "number" ? link.weight : 0,
    updatedAt: link.updatedAt ?? "1970-01-01",
    iconUrl: getSiteIconUrl(link.href, link.iconApi),
  };
}

const rawGroups = siteLinksJson as RawSiteLinkGroup[];

export const siteLinkGroups: SiteLinkGroup[] = rawGroups.map((group) => ({
  id: group.id,
  title: group.title,
  description: group.description,
  links: group.links.map(normalizeSiteLink),
}));
