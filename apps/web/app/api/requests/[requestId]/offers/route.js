import { proxyAuthed } from "@/lib/api";

export async function POST(request, { params }) {
  const { requestId } = await params;
  const body = await request.json();
  return proxyAuthed(`/requests/${requestId}/offers`, { body });
}
