import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExcelJS from 'exceljs';
import { ExportReportService } from '@/modules/reports/services/ExportReportService';
import { ListTransactionsService } from '@/modules/transactions/services/ListTransactionsService';

describe('ExportReportService', () => {
  let listTransactions: ListTransactionsService;
  let exportReportService: ExportReportService;

  const sampleTransactions = [
    {
      occurredAt: new Date('2024-05-01'),
      description: 'Salário',
      type: 'income',
      amount: 1000,
      wallet: { name: 'Carteira Principal' },
      category: { name: 'Trabalho' },
    },
  ];

  beforeEach(() => {
    listTransactions = {
      execute: vi.fn(),
    } as any;

    exportReportService = new ExportReportService(listTransactions);
  });

  it('should generate a valid Excel workbook with translated type and formatted values', async () => {
    vi.spyOn(listTransactions, 'execute').mockResolvedValue(sampleTransactions as any);

    const buffer = await exportReportService.execute('user-1', { format: 'excel' });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet('Relatório');
    const row = sheet!.getRow(2);

    expect(row.getCell(2).value).toBe('Salário');
    expect(row.getCell(3).value).toBe('Receita');
    expect(row.getCell(4).value).toBe(1000);
    expect(row.getCell(5).value).toBe('Carteira Principal');
    expect(row.getCell(6).value).toBe('Trabalho');
  });

  it('should generate a valid PDF buffer', async () => {
    vi.spyOn(listTransactions, 'execute').mockResolvedValue(sampleTransactions as any);

    const buffer = await exportReportService.execute('user-1', { format: 'pdf' });

    expect(buffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should forward start_date/end_date filters to ListTransactionsService', async () => {
    vi.spyOn(listTransactions, 'execute').mockResolvedValue([] as any);

    await exportReportService.execute('user-1', {
      format: 'excel',
      start_date: '2024-01-01T00:00:00.000Z',
      end_date: '2024-01-31T00:00:00.000Z',
    });

    expect(listTransactions.execute).toHaveBeenCalledWith('user-1', {
      start_date: '2024-01-01T00:00:00.000Z',
      end_date: '2024-01-31T00:00:00.000Z',
    });
  });
});
