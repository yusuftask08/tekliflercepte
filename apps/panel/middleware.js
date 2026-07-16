import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

/** Authorization at the edge, before any rendering starts. The (admin)
 *  layout's redirect() is a second line of defense but isn't sufficient on
 *  its own — during React's streaming SSR, a protected route's data can be
 *  flushed to the client before the layout's redirect resolves, so a raw
 *  HTTP client (curl, a script, or a browser that never runs the JS) can see
 *  it. Middleware runs before any component renders, so it can't leak. */
export function middleware(request) {
  const token = request.cookies.get("session")?.value;
  let user = null;
  if (token) {
    try {
      user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      user = null;
    }
  }

  if (!user || user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/giris", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!giris|api|_next/static|_next/image|favicon.ico).*)"],
};
