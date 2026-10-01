import { describe, it, expect } from 'vitest';
import { ReportDateRangeDTO } from '@/modules/reports/dtos/ReportDateRangeDTO';

describe('ReportDateRangeDTO', () => {
  it('should accept a valid range where end_date is after start_date', () => {
    expect(() => ReportDateRangeDTO.parse({ start_date: '2026-09-01', end_date: '2026-09-07' })).not.toThrow();
  });

  it('should accept equal start_date and end_date', () => {
    expect(() => ReportDateRangeDTO.parse({ start_date: '2026-09-01', end_date: '2026-09-01' })).not.toThrow();
  });

  it('should accept an omitted range', () => {
    expect(() => ReportDateRangeDTO.parse({})).not.toThrow();
  });

  it('should accept only start_date or only end_date', () => {
    expect(() => ReportDateRangeDTO.parse({ start_date: '2026-09-01' })).not.toThrow();
    expect(() => ReportDateRangeDTO.parse({ end_date: '2026-09-01' })).not.toThrow();
  });

  it('should reject when end_date is before start_date', () => {
    expect(() => ReportDateRangeDTO.parse({ start_date: '2026-09-10', end_date: '2026-09-01' })).toThrow();
  });
});
