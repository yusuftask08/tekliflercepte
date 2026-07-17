import { cache } from "react";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const SESSION_COOKIE = "session";

/** `secure` is conditional because dev runs over plain http://localhost —
 *  a Secure cookie is silently dropped there, breaking login in dev. */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function getSessionToken() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

// Almost every page calls this directly *and* renders <SiteHeader/>, which
// calls it again — cache() collapses all of those into one JWT verify per
// request instead of three or four.
export const getSessionUser = cache(async function getSessionUser() {
  const token = await getSessionToken();
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return {
      id: decoded.sub,
      role: decoded.role,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
    };
  } catch {
    return null;
  }
});
