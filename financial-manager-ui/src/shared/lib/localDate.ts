function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** Data de calendário (YYYY-MM-DD) no fuso do navegador, para valor de `<input type="date">`. */
export function toLocalDateInput(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Meia-noite UTC do dia de hoje no fuso do navegador, comparável com datas de calendário vindas da API. */
export function todayAsUtcMidnight(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}
