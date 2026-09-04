import { proxyAuthed } from "@/lib/api";

export async function POST() {
  return proxyAuthed("/me/phone/send-code");
}
