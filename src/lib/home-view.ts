import { isModuleId, moduleIds, type ModuleId } from "@/lib/tool-modules";

type SiteViewId = "sites-center" | "sites-favorites";
export type HomeViewId = "all" | ModuleId | SiteViewId;
export const homeModuleViews = [...moduleIds];

export function isModuleHomeView(view: string): view is ModuleId {
  return isModuleId(view);
}

export function getHomeViewPath(view: HomeViewId) {
  switch (view) {
    case "all":
      return "/";
    case "sites-center":
      return "/sites";
    case "sites-favorites":
      return "/sites/favorites";
    default:
      return `/view/${view}`;
  }
}
