import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

export async function POST(request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Giriş yapman gerekiyor" }, { status: 401 });
  }

  const formData = await request.formData();
  const res = await fetch(apiUrl("/uploads"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
