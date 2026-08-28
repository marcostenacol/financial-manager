export interface InvoicePeriod {
  referenceMonth: string;
  closingDate: Date;
  dueDate: Date;
}

function lastDayOfMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function clampDay(year: number, monthIndex: number, day: number): number {
  return Math.min(day, lastDayOfMonth(year, monthIndex));
}

export function computeInvoicePeriod(occurredAt: Date, closingDay: number, dueDay: number): InvoicePeriod {
  const day = occurredAt.getUTCDate();
  let year = occurredAt.getUTCFullYear();
  let monthIndex = occurredAt.getUTCMonth();

  if (day > closingDay) {
    monthIndex += 1;
    if (monthIndex > 11) {
      monthIndex = 0;
      year += 1;
    }
  }

  const referenceMonth = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  const closingDate = new Date(Date.UTC(year, monthIndex, clampDay(year, monthIndex, closingDay)));
  const dueDate = new Date(Date.UTC(year, monthIndex, clampDay(year, monthIndex, dueDay)));

  return { referenceMonth, closingDate, dueDate };
}
