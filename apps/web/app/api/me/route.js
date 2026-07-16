import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";
import { getSessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/session";

export async function PATCH(request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Giriş yapman gerekiyor" }, { status: 401 });
  }

  const body = await request.json();
  const res = await fetch(apiUrl("/me"), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
