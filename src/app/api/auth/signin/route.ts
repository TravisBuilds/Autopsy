import { NextResponse } from "next/server";
import { USER_COOKIE } from "@/lib/auth/constants";

export async function POST(request: Request) {
  const body = (await request.json()) as { displayName?: string; email?: string };
  const displayName = body.displayName?.trim();

  if (!displayName) {
    return NextResponse.json({ error: "Display name is required" }, { status: 400 });
  }

  const user = {
    id: crypto.randomUUID(),
    displayName,
    email: body.email?.trim() || undefined,
  };

  const res = NextResponse.json({ user });
  res.cookies.set(USER_COOKIE, JSON.stringify(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return res;
}
