import { proxyAuthed } from "@/lib/api";

export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  return proxyAuthed(`/admin/provider-documents/${id}/reject`, { body });
}
