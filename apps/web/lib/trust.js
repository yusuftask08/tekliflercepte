export function formatResponseTime(minutes) {
  if (minutes == null) return null;
  if (minutes < 60) return `~${Math.max(1, Math.round(minutes))} dk içinde yanıt`;
  if (minutes < 24 * 60) return `~${Math.round(minutes / 60)} saat içinde yanıt`;
  return `~${Math.round(minutes / (24 * 60))} gün içinde yanıt`;
}
