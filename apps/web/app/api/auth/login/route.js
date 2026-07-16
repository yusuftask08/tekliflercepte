import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/session";

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

  const response = NextResponse.json({ user: data.user });
  response.cookies.set(SESSION_COOKIE, data.token, SESSION_COOKIE_OPTIONS);
  return response;
}
