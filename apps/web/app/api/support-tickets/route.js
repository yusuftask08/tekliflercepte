import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

// Unlike proxyAuthed, this is open to logged-out visitors (/iletisim is a
// public page) — the Bearer token is attached only when a session happens
// to exist, so the API can attribute the ticket to a user without the form
// requiring login.
export async function POST(request) {
  const body = await request.json();
  const token = await getSessionToken();
  const res = await fetch(apiUrl("/support-tickets"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
