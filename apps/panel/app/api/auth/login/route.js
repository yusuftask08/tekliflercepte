import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(request) {
  const body = await request.json();
  const res = await fetch(apiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }
  if (data.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Bu hesabın panele erişim yetkisi yok" }, { status: 403 });
  }

  const response = NextResponse.json({ user: data.user });
  response.cookies.set(SESSION_COOKIE, data.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
