import { NextResponse } from "next/server";
import { clearWhoopCookies } from "@/lib/auth/session";

export async function POST() {
  await clearWhoopCookies();
  return NextResponse.json({ ok: true });
}
