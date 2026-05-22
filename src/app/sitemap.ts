import type { MetadataRoute } from "next";
import { moduleIds, toolDemos } from "@/lib/tool-modules";
import { siteUrl } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/blog",
    "/tools",
    "/tools/markdown-preview",
    "/sites",
  ];

  const moduleRoutes = moduleIds.flatMap((moduleId) => [
    `/tools/${moduleId}`,
    `/view/${moduleId}`,
  ]);

  const toolRoutes = toolDemos
    .map((tool) => tool.path)
    .filter((path): path is string => Boolean(path))
    .filter((path) => path !== "/tools/markdown-preview");

  const routes = [...staticRoutes, ...moduleRoutes, ...toolRoutes];

  return Array.from(new Set(routes)).map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: route === "/blog" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.startsWith("/tools/") ? 0.8 : 0.7,
  }));
}
