import { HomePageClient } from "@/components/home/home-page-client";
import { getSidebarWidgetsData } from "@/lib/sidebar-widgets";

export default async function HomePage() {
  const initialWidgetsData = await getSidebarWidgetsData().catch(() => null);

  return (
    <HomePageClient
      initialView="all"
      initialWidgetsData={initialWidgetsData}
    />
  );
}
