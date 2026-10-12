import { afterEach, describe, expect, it, vi } from 'vitest';
import { isFutureDate } from './isFutureDate';
import { todayAsUtcMidnight, toLocalDateInput } from './localDate';

describe('datas de calendário no fuso local', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('toLocalDateInput usa o dia local, não o dia UTC, à noite', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 12, 22, 30));

    expect(toLocalDateInput()).toBe('2026-10-12');
  });

  it('isFutureDate trata amanhã como futuro e hoje como não futuro', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 12, 22, 30));

    expect(isFutureDate('2026-10-12')).toBe(false);
    expect(isFutureDate('2026-10-13')).toBe(true);
    expect(isFutureDate('2026-10-11')).toBe(false);
  });

  it('todayAsUtcMidnight devolve meia-noite UTC do dia local', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 12, 22, 30));

    expect(todayAsUtcMidnight().toISOString()).toBe('2026-10-12T00:00:00.000Z');
  });
});
