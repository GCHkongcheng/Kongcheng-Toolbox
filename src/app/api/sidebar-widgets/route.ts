import { NextResponse } from "next/server";
import { getSidebarWidgetsData } from "@/lib/sidebar-widgets";

export async function GET() {
  return NextResponse.json(await getSidebarWidgetsData());
}
