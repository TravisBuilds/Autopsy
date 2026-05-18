import { NextResponse } from "next/server";
import { USER_COOKIE } from "@/lib/auth/constants";
import { clearWhoopCookies } from "@/lib/auth/session";

export async function POST() {
  await clearWhoopCookies();
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(USER_COOKIE);
  return res;
}
