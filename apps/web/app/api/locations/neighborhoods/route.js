import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const il = searchParams.get("il");
  const ilce = searchParams.get("ilce");
  const res = await fetch(apiUrl(`/locations/neighborhoods?il=${encodeURIComponent(il)}&ilce=${encodeURIComponent(ilce)}`));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
