import { proxyAuthed } from "@/lib/api";

export async function DELETE(_request, { params }) {
  const { id } = await params;
  return proxyAuthed(`/me/provider-documents/${id}`, { method: "DELETE" });
}
