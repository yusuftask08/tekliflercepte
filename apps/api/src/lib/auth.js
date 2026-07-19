import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const TOKEN_TTL = "30d";

export function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, firstName: user.firstName, lastName: user.lastName },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );
}

/** Short-lived, single-purpose token for the forgot-password email link —
 *  separate `purpose` claim so a leaked/expired reset link can never be
 *  reused as a session token. */
export function signPasswordResetToken(user) {
  return jwt.sign({ sub: user.id, purpose: "password-reset" }, process.env.JWT_SECRET, {
    expiresIn: "30m",
  });
}

export function verifyPasswordResetToken(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.purpose !== "password-reset") throw new Error("invalid purpose");
  return decoded;
}

export function requireAuth(req, reply, done) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    reply.code(401).send({ error: "Giriş yapman gerekiyor" });
    return;
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    done();
  } catch {
    reply.code(401).send({ error: "Oturum geçersiz, tekrar giriş yap" });
  }
}

export function requireAdmin(req, reply, done) {
  requireAuth(req, reply, () => {
    if (req.user.role !== "ADMIN") {
      reply.code(403).send({ error: "Bu işlem için yönetici yetkisi gerekiyor" });
      return;
    }
    done();
  });
}

/** ADMIN or MODERATOR — for the subset of admin actions moderators are
 *  allowed to do (request approval, report resolution). Sensitive ops
 *  (password reset, premium toggle, category CRUD, user/provider lists)
 *  stay behind requireAdmin. */
export function requireStaff(req, reply, done) {
  requireAuth(req, reply, () => {
    if (req.user.role !== "ADMIN" && req.user.role !== "MODERATOR") {
      reply.code(403).send({ error: "Bu işlem için yetkin yok" });
      return;
    }
    done();
  });
}
