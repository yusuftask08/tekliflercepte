import { proxyAuthed } from "@/lib/api";

export async function POST(request, { params }) {
  const { offerId } = await params;
  return proxyAuthed(`/offers/${offerId}/typing`, { body: {} });
}
