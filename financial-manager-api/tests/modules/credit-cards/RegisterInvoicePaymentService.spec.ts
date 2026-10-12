import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/database/PrismaClient', () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback({})),
  },
}));

import { Prisma } from '@prisma/client';
import { RegisterInvoicePaymentService } from '@/modules/credit-cards/services/RegisterInvoicePaymentService';

describe('RegisterInvoicePaymentService', () => {
  let walletRepository: any;
  let invoiceRepository: any;
  let invoicePaymentRepository: any;
  let transactionRepository: any;
  let cache: any;
  let service: RegisterInvoicePaymentService;

  beforeEach(() => {
    walletRepository = { findById: vi.fn(), update: vi.fn() };
    invoiceRepository = { findById: vi.fn() };
    invoicePaymentRepository = { create: vi.fn(), findAllByInvoiceId: vi.fn().mockResolvedValue([]) };
    transactionRepository = { findAllByInvoiceId: vi.fn().mockResolvedValue([]) };
    cache = { del: vi.fn(), delPattern: vi.fn() };
    service = new RegisterInvoicePaymentService(walletRepository, invoiceRepository, invoicePaymentRepository, transactionRepository, cache);
  });

  it('registers a partial payment for an invoice', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    walletRepository.findById.mockResolvedValue({ id: walletId, userId, type: 'credit' });
    invoiceRepository.findById.mockResolvedValue({ id: 'invoice-1', walletId });
    transactionRepository.findAllByInvoiceId.mockResolvedValue([{ type: 'expense', amount: 100 }]);
    invoicePaymentRepository.create.mockResolvedValue({ id: 'payment-1', invoiceId: 'invoice-1', amount: 60 });

    const result = await service.execute(walletId, 'invoice-1', { amount: 60 }, userId);

    expect(result).toHaveProperty('id', 'payment-1');
    expect(invoicePaymentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ invoiceId: 'invoice-1' }),
      expect.anything(),
    );
  });

  it('raises the credit card balance by the paid amount without touching other wallets', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    walletRepository.findById.mockResolvedValue({ id: walletId, userId, type: 'credit' });
    invoiceRepository.findById.mockResolvedValue({ id: 'invoice-1', walletId });
    transactionRepository.findAllByInvoiceId.mockResolvedValue([{ type: 'expense', amount: 100 }]);
    invoicePaymentRepository.create.mockResolvedValue({ id: 'payment-1', invoiceId: 'invoice-1', amount: 60 });

    await service.execute(walletId, 'invoice-1', { amount: 60 }, userId);

    expect(walletRepository.update).toHaveBeenCalledTimes(1);
    expect(walletRepository.update).toHaveBeenCalledWith(
      walletId,
      { balance: { increment: new Prisma.Decimal(60) } },
      expect.anything(),
    );
  });

  it('rejects a payment with amount zero or negative', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    walletRepository.findById.mockResolvedValue({ id: walletId, userId, type: 'credit' });
    invoiceRepository.findById.mockResolvedValue({ id: 'invoice-1', walletId });

    await expect(service.execute(walletId, 'invoice-1', { amount: 0 }, userId)).rejects.toThrow(
      'O valor do pagamento deve ser maior que zero',
    );
    expect(invoicePaymentRepository.create).not.toHaveBeenCalled();
  });

  it('rejects a payment amount greater than the invoice remaining balance', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    walletRepository.findById.mockResolvedValue({ id: walletId, userId, type: 'credit' });
    invoiceRepository.findById.mockResolvedValue({ id: 'invoice-1', walletId });
    transactionRepository.findAllByInvoiceId.mockResolvedValue([{ type: 'expense', amount: 100 }]);
    invoicePaymentRepository.findAllByInvoiceId.mockResolvedValue([{ amount: 60 }]);

    await expect(service.execute(walletId, 'invoice-1', { amount: 50 }, userId)).rejects.toThrow(
      'O valor informado é maior que o saldo pendente da fatura',
    );
    expect(invoicePaymentRepository.create).not.toHaveBeenCalled();
    expect(walletRepository.update).not.toHaveBeenCalled();
  });
});
