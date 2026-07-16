import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export async function POST(request) {
  const body = await request.json();
  const res = await fetch(apiUrl("/auth/forgot-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
