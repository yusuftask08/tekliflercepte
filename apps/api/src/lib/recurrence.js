import { prisma } from "@tekliflercepte/db";

const INTERVAL_DAYS = { WEEKLY: 7, MONTHLY: 30 };

/** Called after a recurring request is closed (POST /complete or a review
 *  closing it) — clones it into a fresh PENDING_REVIEW request for the next
 *  cycle. Same moderation gate as any manually-created request, no bypass
 *  just because it's automatic. Best-effort: never let a clone failure
 *  break the completion/review it hangs off of. */
export async function maybeCreateNextRecurrence(request) {
  if (!request.isRecurring || !request.recurrenceInterval) return null;
  const days = INTERVAL_DAYS[request.recurrenceInterval];
  const base = request.preferredDate ?? request.createdAt;
  const nextDate = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

  return prisma.serviceRequest.create({
    data: {
      customerId: request.customerId,
      categoryId: request.categoryId,
      city: request.city,
      district: request.district,
      details: request.details,
      answers: request.answers ?? undefined,
      budget: request.budget,
      preferredDate: nextDate,
      preferredTimeSlot: request.preferredTimeSlot,
      isRecurring: true,
      recurrenceInterval: request.recurrenceInterval,
      recurrenceParentId: request.id,
    },
  });
}
