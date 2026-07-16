import { proxyAuthed } from "@/lib/api";

export async function PUT(request) {
  const body = await request.json();
  return proxyAuthed("/me/provider-profile", { method: "PUT", body });
}
