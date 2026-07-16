import { proxyAuthed } from "@/lib/api";

export async function POST(_request, { params }) {
  const { userId } = await params;
  return proxyAuthed(`/me/blocks/${userId}`);
}

export async function DELETE(_request, { params }) {
  const { userId } = await params;
  return proxyAuthed(`/me/blocks/${userId}`, { method: "DELETE" });
}
