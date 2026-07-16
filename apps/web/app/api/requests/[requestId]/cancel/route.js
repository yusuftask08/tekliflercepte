import { proxyAuthed } from "@/lib/api";

export async function POST(_request, { params }) {
  const { requestId } = await params;
  return proxyAuthed(`/requests/${requestId}/cancel`);
}
