import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export async function GET(request, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const qs = city ? `?city=${encodeURIComponent(city)}` : "";
  const res = await fetch(apiUrl(`/categories/${id}/price-estimate${qs}`), { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
