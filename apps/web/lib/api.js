import { cache } from "react";
import { NextResponse } from "next/server";
import { getSessionToken } from "@/lib/session";

export function apiUrl(path) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  return `${base}${path}`;
}

/** Both the root layout (for BottomNavWrapper) and SiteHeader (rendered on
 *  almost every page) need this — wrapped in React's cache() so the two
 *  calls within a single request collapse into one actual fetch instead of
 *  hitting the API twice per page load. */
export const getUnreadCount = cache(async function getUnreadCount(token) {
  if (!token) return 0;
  try {
    const res = await fetch(apiUrl("/me/unread-count"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count ?? 0;
  } catch {
    return 0;
  }
});

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
