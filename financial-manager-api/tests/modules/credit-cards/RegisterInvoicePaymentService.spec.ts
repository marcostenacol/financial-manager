import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterInvoicePaymentService } from '@/modules/credit-cards/services/RegisterInvoicePaymentService';

describe('RegisterInvoicePaymentService', () => {
  let walletRepository: any;
  let invoiceRepository: any;
  let invoicePaymentRepository: any;
  let service: RegisterInvoicePaymentService;

  beforeEach(() => {
    walletRepository = { findById: vi.fn() };
    invoiceRepository = { findById: vi.fn() };
    invoicePaymentRepository = { create: vi.fn() };
    service = new RegisterInvoicePaymentService(walletRepository, invoiceRepository, invoicePaymentRepository);
  });

  it('registers a partial payment for an invoice', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    walletRepository.findById.mockResolvedValue({ id: walletId, userId, type: 'credit' });
    invoiceRepository.findById.mockResolvedValue({ id: 'invoice-1', walletId });
    invoicePaymentRepository.create.mockResolvedValue({ id: 'payment-1', invoiceId: 'invoice-1', amount: 60 });

    const result = await service.execute(walletId, 'invoice-1', { amount: 60 }, userId);

    expect(result).toHaveProperty('id', 'payment-1');
    expect(invoicePaymentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ invoiceId: 'invoice-1' }),
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
});
