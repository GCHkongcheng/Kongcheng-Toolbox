import { NextResponse } from "next/server";
import { siteLinkGroups } from "@/lib/site-links";

export async function GET() {
  return NextResponse.json({
    groups: siteLinkGroups,
  });
}
