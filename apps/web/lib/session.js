import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const SESSION_COOKIE = "session";

export async function getSessionToken() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function getSessionUser() {
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
}
