import { apiUrl } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

// Streams the API's Server-Sent Events response straight through — the
// browser's EventSource hits this same-origin route (never sees the JWT),
// and this is the one place that attaches the Bearer token server-side.
export async function GET(request, { params }) {
  const { offerId } = await params;
  const token = await getSessionToken();
  if (!token) return new Response("Unauthorized", { status: 401 });

  const apiRes = await fetch(apiUrl(`/offers/${offerId}/messages/stream`), {
    headers: { Authorization: `Bearer ${token}` },
  });

  return new Response(apiRes.body, {
    status: apiRes.status,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

export const dynamic = "force-dynamic";
