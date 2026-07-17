import { proxyAuthed } from "@/lib/api";

export async function GET(request, { params }) {
  const { offerId } = await params;
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  return proxyAuthed(`/offers/${offerId}/messages${qs ? `?${qs}` : ""}`, { method: "GET" });
}

export async function POST(request, { params }) {
  const { offerId } = await params;
  const body = await request.json();
  return proxyAuthed(`/offers/${offerId}/messages`, { body });
}
