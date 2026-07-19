import { proxyAuthed } from "@/lib/api";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  return proxyAuthed(`/admin/categories/${id}`, { method: "PATCH", body });
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  return proxyAuthed(`/admin/categories/${id}`, { method: "DELETE" });
}
