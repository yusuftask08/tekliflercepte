import { prisma } from "@tekliflercepte/db";

/** Fire-and-forget — an audit write failing must never block the admin
 *  action it's logging. */
export function logAdminAction({ adminId, action, targetId, targetType }) {
  prisma.adminAuditLog
    .create({ data: { adminId, action, targetId, targetType } })
    .catch((err) => console.error("audit log write failed:", err));
}
