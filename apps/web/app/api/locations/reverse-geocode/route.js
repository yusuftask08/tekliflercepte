import { NextResponse } from "next/server";
import { slugifyTr, TR_LOCATIONS } from "@/lib/turkey-locations";

// Nominatim's usage policy requires a descriptive User-Agent identifying
// the application — anonymous/default UAs get blocked. Max 1 req/sec, fine
// for a single user-triggered "use my location" click.
const USER_AGENT = "TekliflerCepte/1.0 (+https://tekliflercepte.com)";

function matchCity(nominatimState) {
  if (!nominatimState) return null;
  const slug = slugifyTr(nominatimState.replace(/\s+(ili|province)$/i, ""));
  return TR_LOCATIONS.find((l) => slugifyTr(l.name) === slug)?.name ?? null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  if (!lat || !lon) {
    return NextResponse.json({ error: "lat ve lon zorunlu" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=8&addressdetails=1`,
      { headers: { "User-Agent": USER_AGENT }, cache: "no-store" }
    );
    if (!res.ok) return NextResponse.json({ city: null });

    const data = await res.json();
    const city = matchCity(data?.address?.state ?? data?.address?.province);
    return NextResponse.json({ city });
  } catch {
    return NextResponse.json({ city: null });
  }
}
