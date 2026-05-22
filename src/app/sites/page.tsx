import type { Metadata } from "next";
import { HomePageClient } from "@/components/home/home-page-client";
import { getSidebarWidgetsData } from "@/lib/sidebar-widgets";

export const metadata: Metadata = {
  title: "网址导航中心",
  description: "浏览空城工具箱整理的开发、学习与效率网址导航。",
  alternates: {
    canonical: "/sites",
  },
  openGraph: {
    title: "网址导航中心",
    description: "浏览空城工具箱整理的开发、学习与效率网址导航。",
    url: "/sites",
    siteName: "空城工具箱",
  },
};

export default async function SitesPage() {
  const initialWidgetsData = await getSidebarWidgetsData().catch(() => null);

  return (
    <HomePageClient
      initialView="sites-center"
      initialWidgetsData={initialWidgetsData}
    />
  );
}
