import { proxyAuthed } from "@/lib/api";

export async function POST(_request, { params }) {
  const { offerId } = await params;
  return proxyAuthed(`/offers/${offerId}/select`);
}
