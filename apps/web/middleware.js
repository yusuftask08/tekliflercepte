import { NextResponse } from "next/server";

/** Content-Security-Policy — shipped Report-Only for now: it logs would-be
 *  violations to the browser console without blocking anything. A real CSP
 *  needs a browser check (open the site, watch DevTools console for CSP
 *  warnings across the main flows — homepage, usta/[id], hizmet/[kategori]/
 *  [sehir], talep-olustur's photo upload, mesajlar's image messages) before
 *  it's safe to enforce. Once that check is clean, flip this to true.
 *  See project_security_headers_round — this was deferred specifically
 *  because the homepage/usta/[id] JSON-LD script tags needed nonce wiring
 *  first (done here + in each of those pages). */
const CSP_ENFORCE = false;

/** Only applied in production. Next's dev server relies on eval-based
 *  bundling for Fast Refresh, which a strict script-src would break, and
 *  the API's dev port drifts (see next.config.js's images.remotePatterns
 *  fix) so a hardcoded dev img-src origin would be fragile anyway. */
export function middleware(request) {
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "https://api.tekliflercepte.com";
  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: ${apiOrigin};
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(
    CSP_ENFORCE ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only",
    csp
  );
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|manifest).*)"],
};
