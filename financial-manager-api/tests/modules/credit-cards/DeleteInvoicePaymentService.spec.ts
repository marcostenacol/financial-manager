import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/database/PrismaClient', () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback({})),
  },
}));

import { DeleteInvoicePaymentService } from '@/modules/credit-cards/services/DeleteInvoicePaymentService';

describe('DeleteInvoicePaymentService', () => {
  let walletRepository: any;
  let invoiceRepository: any;
  let invoicePaymentRepository: any;
  let cache: any;
  let service: DeleteInvoicePaymentService;

  beforeEach(() => {
    walletRepository = { findById: vi.fn(), update: vi.fn() };
    invoiceRepository = { findById: vi.fn() };
    invoicePaymentRepository = { findById: vi.fn(), delete: vi.fn() };
    cache = { del: vi.fn(), delPattern: vi.fn() };
    service = new DeleteInvoicePaymentService(walletRepository, invoiceRepository, invoicePaymentRepository, cache);
  });

  it('removes the payment and lowers the credit card balance by the same amount', async () => {
    const userId = 'user-1';
    walletRepository.findById.mockResolvedValue({ id: 'wallet-1', userId, type: 'credit' });
    invoiceRepository.findById.mockResolvedValue({ id: 'invoice-1', walletId: 'wallet-1' });
    invoicePaymentRepository.findById.mockResolvedValue({ id: 'payment-1', invoiceId: 'invoice-1', amount: 60 });

    await service.execute('wallet-1', 'invoice-1', 'payment-1', userId);

    expect(invoicePaymentRepository.delete).toHaveBeenCalledWith('payment-1', expect.anything());
    expect(walletRepository.update).toHaveBeenCalledWith(
      'wallet-1',
      { balance: { decrement: 60 } },
      expect.anything(),
    );
  });

  it('does not change the balance when the payment does not belong to the invoice', async () => {
    const userId = 'user-1';
    walletRepository.findById.mockResolvedValue({ id: 'wallet-1', userId, type: 'credit' });
    invoiceRepository.findById.mockResolvedValue({ id: 'invoice-1', walletId: 'wallet-1' });
    invoicePaymentRepository.findById.mockResolvedValue({ id: 'payment-1', invoiceId: 'other-invoice', amount: 60 });

    await expect(service.execute('wallet-1', 'invoice-1', 'payment-1', userId)).rejects.toThrow('Pagamento não encontrado');
    expect(walletRepository.update).not.toHaveBeenCalled();
    expect(invoicePaymentRepository.delete).not.toHaveBeenCalled();
  });
});
