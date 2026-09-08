export function isFutureDate(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const picked = new Date(dateStr);
  picked.setHours(0, 0, 0, 0);
  return picked.getTime() > today.getTime();
}
