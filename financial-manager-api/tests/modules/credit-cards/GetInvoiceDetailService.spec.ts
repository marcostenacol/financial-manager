import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Prisma } from '@prisma/client';
import { GetInvoiceDetailService } from '@/modules/credit-cards/services/GetInvoiceDetailService';
import { TransactionTypeEnum } from '@/modules/transactions/enums/TransactionTypeEnum';

describe('GetInvoiceDetailService', () => {
  let walletRepository: any;
  let invoiceRepository: any;
  let invoicePaymentRepository: any;
  let transactionRepository: any;
  let service: GetInvoiceDetailService;

  beforeEach(() => {
    walletRepository = { findById: vi.fn() };
    invoiceRepository = { findById: vi.fn() };
    invoicePaymentRepository = { findAllByInvoiceId: vi.fn() };
    transactionRepository = { findAllByInvoiceId: vi.fn() };

    service = new GetInvoiceDetailService(walletRepository, invoiceRepository, invoicePaymentRepository, transactionRepository);
  });

  it('returns the invoice with its transactions and payments', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';

    walletRepository.findById.mockResolvedValue({ id: walletId, userId, type: 'credit' });
    invoiceRepository.findById.mockResolvedValue({
      id: 'invoice-1', walletId, referenceMonth: '2026-08', closingDate: new Date('2026-08-05'), dueDate: new Date('2026-08-15'),
    });
    transactionRepository.findAllByInvoiceId.mockResolvedValue([
      { id: 'tx-1', amount: new Prisma.Decimal(100), type: TransactionTypeEnum.EXPENSE },
    ]);
    invoicePaymentRepository.findAllByInvoiceId.mockResolvedValue([]);

    const result = await service.execute(walletId, 'invoice-1', userId);

    expect(result.totalAmount).toBe(100);
    expect(result.transactions).toHaveLength(1);
    expect(result.payments).toEqual([]);
  });

  it('throws when the invoice does not belong to the wallet', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';

    walletRepository.findById.mockResolvedValue({ id: walletId, userId, type: 'credit' });
    invoiceRepository.findById.mockResolvedValue({ id: 'invoice-1', walletId: 'other-wallet' });

    await expect(service.execute(walletId, 'invoice-1', userId)).rejects.toThrow('Fatura não encontrada');
  });
});
