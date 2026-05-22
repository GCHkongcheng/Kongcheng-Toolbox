import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const moduleViews = new Set(["prompt", "writing", "code", "docs", "learning"]);

function getLegacyViewPath(view: string | null) {
  if (!view) {
    return null;
  }

  if (view === "all") {
    return "/";
  }

  if (view === "sites-center") {
    return "/sites";
  }

  if (view === "sites-favorites") {
    return "/sites/favorites";
  }

  if (moduleViews.has(view)) {
    return `/view/${view}`;
  }

  return null;
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const targetPath = getLegacyViewPath(
    request.nextUrl.searchParams.get("view"),
  );

  if (!targetPath) {
    return NextResponse.next();
  }

  const redirectUrl = new URL(targetPath, request.url);
  return NextResponse.redirect(redirectUrl, 308);
}

export const config = {
  matcher: ["/"],
};
