import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePageClient } from "@/components/home/home-page-client";
import { getModuleMeta } from "@/lib/tool-modules";
import { homeModuleViews, isModuleHomeView } from "@/lib/home-view";
import { getSidebarWidgetsData } from "@/lib/sidebar-widgets";

export function generateStaticParams() {
  return homeModuleViews.map((view) => ({ view }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ view: string }>;
}): Promise<Metadata> {
  const { view } = await params;
  const moduleMeta = isModuleHomeView(view) ? getModuleMeta(view) : null;

  if (!moduleMeta) {
    return {};
  }

  return {
    title: moduleMeta.title,
    description: moduleMeta.subtitle,
    alternates: {
      canonical: `/view/${moduleMeta.id}`,
    },
  };
}

export default async function HomeModuleViewPage({
  params,
}: {
  params: Promise<{ view: string }>;
}) {
  const { view } = await params;

  if (!isModuleHomeView(view)) {
    notFound();
  }

  const initialWidgetsData = await getSidebarWidgetsData().catch(() => null);

  return (
    <HomePageClient
      initialView={view}
      initialWidgetsData={initialWidgetsData}
    />
  );
}
