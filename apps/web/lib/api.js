import { NextResponse } from "next/server";
import { getSessionToken } from "@/lib/session";

export function apiUrl(path) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  return `${base}${path}`;
}

/** Forwards a proxied mutation to the API with the session's Bearer token,
 *  used by app/api/* route handlers so client components never see the JWT. */
export async function proxyAuthed(path, { method = "POST", body } = {}) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Giriş yapman gerekiyor" }, { status: 401 });
  }
  const res = await fetch(apiUrl(path), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
