import { proxyAuthed } from "@/lib/api";

export async function GET() {
  return proxyAuthed("/me/notifications", { method: "GET" });
}
