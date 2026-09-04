import { proxyAuthed } from "@/lib/api";

export async function POST(request) {
  const body = await request.json();
  return proxyAuthed("/me/phone/verify-code", { body });
}
