import type { Metadata } from "next";
import { HomePageClient } from "@/components/home/home-page-client";
import { getSidebarWidgetsData } from "@/lib/sidebar-widgets";

export const metadata: Metadata = {
  title: "我的收藏",
  description: "查看你在空城工具箱中的网址收藏列表。",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/sites/favorites",
  },
};

export default async function FavoriteSitesPage() {
  const initialWidgetsData = await getSidebarWidgetsData().catch(() => null);

  return (
    <HomePageClient
      initialView="sites-favorites"
      initialWidgetsData={initialWidgetsData}
    />
  );
}
