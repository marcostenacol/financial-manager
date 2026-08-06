/**
 * Período corrente no formato "YYYY-MM", usado para saber se uma pessoa com
 * paymentFrequency MONTHLY já foi marcada como paga no mês atual — sem cron/job
 * de reset, a comparação com o período corrente já reabre a pendência a cada mês novo.
 */
export function getCurrentPeriod(): string {
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');

  return `${now.getUTCFullYear()}-${month}`;
}
