import { proxyAuthed } from "@/lib/api";

export async function POST(_request, { params }) {
  const { providerId } = await params;
  return proxyAuthed(`/me/favorites/${providerId}`, { method: "POST" });
}

export async function DELETE(_request, { params }) {
  const { providerId } = await params;
  return proxyAuthed(`/me/favorites/${providerId}`, { method: "DELETE" });
}
