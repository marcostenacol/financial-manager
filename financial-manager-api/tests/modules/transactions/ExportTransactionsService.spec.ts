import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportTransactionsService } from '@/modules/transactions/services/ExportTransactionsService';
import { ListTransactionsService } from '@/modules/transactions/services/ListTransactionsService';

describe('ExportTransactionsService', () => {
  let listTransactions: ListTransactionsService;
  let exportTransactionsService: ExportTransactionsService;

  beforeEach(() => {
    listTransactions = {
      execute: vi.fn(),
    } as any;

    exportTransactionsService = new ExportTransactionsService(listTransactions);
  });

  it('should generate a CSV with header and one row per transaction', async () => {
    vi.spyOn(listTransactions, 'execute').mockResolvedValue([
      {
        occurredAt: new Date('2024-05-01'),
        description: 'Salário',
        type: 'income',
        amount: 1000,
        wallet: { name: 'Carteira Principal' },
        category: { name: 'Trabalho' },
      },
    ] as any);

    const csv = await exportTransactionsService.execute('user-1');
    const lines = csv.split('\n');

    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe('Data;Descrição;Tipo;Valor;Carteira;Categoria');
    expect(lines[1]).toBe('01/05/2024;Salário;Receita;1000.00;Carteira Principal;Trabalho');
  });

  it('should escape fields containing the CSV delimiter', async () => {
    vi.spyOn(listTransactions, 'execute').mockResolvedValue([
      {
        occurredAt: new Date('2024-05-01'),
        description: 'Almoço; jantar',
        type: 'expense',
        amount: 50,
        wallet: { name: 'Carteira' },
        category: { name: 'Alimentação' },
      },
    ] as any);

    const csv = await exportTransactionsService.execute('user-1');

    expect(csv).toContain('"Almoço; jantar"');
  });

  it('should return only the header when there are no transactions', async () => {
    vi.spyOn(listTransactions, 'execute').mockResolvedValue([]);

    const csv = await exportTransactionsService.execute('user-1');

    expect(csv).toBe('Data;Descrição;Tipo;Valor;Carteira;Categoria');
  });
});
