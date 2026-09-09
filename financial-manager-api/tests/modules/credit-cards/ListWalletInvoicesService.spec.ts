import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Prisma } from '@prisma/client';
import { ListWalletInvoicesService } from '@/modules/credit-cards/services/ListWalletInvoicesService';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { InvoiceRepositoryInterface } from '@/modules/credit-cards/repositories/contracts/InvoiceRepositoryInterface';
import { InvoicePaymentRepositoryInterface } from '@/modules/credit-cards/repositories/contracts/InvoicePaymentRepositoryInterface';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { TransactionTypeEnum } from '@/modules/transactions/enums/TransactionTypeEnum';

describe('ListWalletInvoicesService', () => {
  let walletRepository: WalletRepositoryInterface;
  let invoiceRepository: InvoiceRepositoryInterface;
  let invoicePaymentRepository: InvoicePaymentRepositoryInterface;
  let transactionRepository: TransactionRepositoryInterface;
  let service: ListWalletInvoicesService;

  beforeEach(() => {
    walletRepository = { findById: vi.fn() } as any;
    invoiceRepository = { findAllByWalletId: vi.fn() } as any;
    invoicePaymentRepository = { findAllByInvoiceIds: vi.fn() } as any;
    transactionRepository = { findAllByInvoiceIds: vi.fn() } as any;

    service = new ListWalletInvoicesService(walletRepository, invoiceRepository, invoicePaymentRepository, transactionRepository);
  });

  it('computes total, paid, remaining and status for each invoice', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';

    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: walletId, userId, type: 'credit' } as any);
    vi.spyOn(invoiceRepository, 'findAllByWalletId').mockResolvedValue([
      { id: 'invoice-1', referenceMonth: '2026-08', closingDate: new Date('2026-08-05'), dueDate: new Date('2026-08-15') },
    ] as any);
    vi.spyOn(transactionRepository, 'findAllByInvoiceIds').mockResolvedValue([
      { invoiceId: 'invoice-1', amount: new Prisma.Decimal(200), type: TransactionTypeEnum.EXPENSE },
      { invoiceId: 'invoice-1', amount: new Prisma.Decimal(50), type: TransactionTypeEnum.INCOME },
    ] as any);
    vi.spyOn(invoicePaymentRepository, 'findAllByInvoiceIds').mockResolvedValue([
      { invoiceId: 'invoice-1', amount: new Prisma.Decimal(60) },
    ] as any);

    const result = await service.execute(walletId, userId);

    expect(result).toHaveLength(1);
    expect(result[0].totalAmount).toBe(150);
    expect(result[0].paidAmount).toBe(60);
    expect(result[0].remainingAmount).toBe(90);
    expect(result[0].status).toBe('partially_paid');
    expect(transactionRepository.findAllByInvoiceIds).toHaveBeenCalledTimes(1);
    expect(transactionRepository.findAllByInvoiceIds).toHaveBeenCalledWith(['invoice-1']);
    expect(invoicePaymentRepository.findAllByInvoiceIds).toHaveBeenCalledTimes(1);
    expect(invoicePaymentRepository.findAllByInvoiceIds).toHaveBeenCalledWith(['invoice-1']);
  });

  it('rejects a non-credit wallet', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: walletId, userId, type: 'checking' } as any);

    await expect(service.execute(walletId, userId)).rejects.toThrow('Esta carteira não é um cartão de crédito');
  });
});
