import { proxyAuthed } from "@/lib/api";

export async function POST(_request, { params }) {
  const { id } = await params;
  return proxyAuthed(`/admin/support-tickets/${id}/resolve`);
}
