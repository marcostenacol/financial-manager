function lastDayOfMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function clampDay(year: number, monthIndex: number, day: number): number {
  return Math.min(day, lastDayOfMonth(year, monthIndex));
}

/** Soma meses a uma data preservando o dia original, clampado no fim do mês quando
 * necessário (ex: 31 de janeiro + 1 mês = 28/29 de fevereiro, nunca "3 de março"). */
export function addMonthsClamped(date: Date, months: number): Date {
  const day = date.getUTCDate();
  let year = date.getUTCFullYear();
  let monthIndex = date.getUTCMonth() + months;

  year += Math.floor(monthIndex / 12);
  monthIndex = ((monthIndex % 12) + 12) % 12;

  return new Date(Date.UTC(year, monthIndex, clampDay(year, monthIndex, day)));
}
