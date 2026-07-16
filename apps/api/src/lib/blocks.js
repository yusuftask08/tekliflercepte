import { prisma } from "@tekliflercepte/db";

/** True if either user has blocked the other — used to stop new messages
 *  and new offers between a blocked pair without touching existing history. */
export async function isBlocked(userIdA, userIdB) {
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: userIdA, blockedUserId: userIdB },
        { blockerId: userIdB, blockedUserId: userIdA },
      ],
    },
  });
  return Boolean(block);
}
