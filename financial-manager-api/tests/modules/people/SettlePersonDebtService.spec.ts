import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/database/PrismaClient', () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback({})),
  },
}));

import { SettlePersonDebtService } from '@/modules/people/services/SettlePersonDebtService';
import { PersonRepositoryInterface } from '@/modules/people/repositories/contracts/PersonRepositoryInterface';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { CategoryRepositoryInterface } from '@/modules/categories/repositories/contracts/CategoryRepositoryInterface';
import { InvoiceRepositoryInterface } from '@/modules/credit-cards/repositories/contracts/InvoiceRepositoryInterface';
import { ListWalletInvoicesService } from '@/modules/credit-cards/services/ListWalletInvoicesService';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { AppError } from '@/shared/errors/AppError';
import { Prisma } from '@prisma/client';

describe('SettlePersonDebtService', () => {
  let personRepository: PersonRepositoryInterface;
  let transactionRepository: TransactionRepositoryInterface;
  let walletRepository: WalletRepositoryInterface;
  let categoryRepository: CategoryRepositoryInterface;
  let invoiceRepository: InvoiceRepositoryInterface;
  let listWalletInvoicesService: ListWalletInvoicesService;
  let cacheTrait: CacheTrait;
  let settlePersonDebtService: SettlePersonDebtService;

  beforeEach(() => {
    personRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAllByOwner: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;

    transactionRepository = {
      create: vi.fn().mockResolvedValue({ id: 'transaction-1' }),
    } as any;

    walletRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    } as any;

    categoryRepository = {
      findById: vi.fn().mockResolvedValue({ id: 'category-1', scope: null }),
    } as any;

    invoiceRepository = {
      findOrCreate: vi.fn().mockResolvedValue({ id: 'invoice-1' }),
    } as any;

    listWalletInvoicesService = {
      execute: vi.fn().mockResolvedValue([]),
    } as any;

    cacheTrait = {
      del: vi.fn(),
      delPattern: vi.fn(),
    } as any;

    settlePersonDebtService = new SettlePersonDebtService(
      personRepository,
      transactionRepository,
      walletRepository,
      categoryRepository,
      invoiceRepository,
      listWalletInvoicesService,
      cacheTrait,
    );
  });

  const baseData = { direction: 'they_owe_me' as const, wallet_id: 'wallet-1', category_id: 'category-1' };

  it('should create an INCOME transaction and zero theyOweMe for a ONE_TIME person', async () => {
    vi.spyOn(personRepository, 'findById').mockResolvedValue({
      id: 'person-1',
      userId: 'user-1',
      name: 'Maria',
      theyOweMe: new Prisma.Decimal(150),
      iOweThem: new Prisma.Decimal(0),
      paymentFrequency: 'ONE_TIME',
    } as any);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: 'wallet-1', userId: 'user-1', scope: 'personal' } as any);

    await settlePersonDebtService.execute('person-1', baseData, 'user-1');

    expect(transactionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'income', amount: expect.any(Object) }),
      expect.anything(),
    );
    expect(walletRepository.update).toHaveBeenCalledWith('wallet-1', { balance: { increment: expect.anything() } }, expect.anything());
    expect(personRepository.update).toHaveBeenCalledWith('person-1', { theyOweMe: 0 }, expect.anything());
  });

  it('should link the INCOME transaction to the person when they owe me', async () => {
    vi.spyOn(personRepository, 'findById').mockResolvedValue({
      id: 'person-1',
      userId: 'user-1',
      name: 'Maria',
      theyOweMe: new Prisma.Decimal(150),
      iOweThem: new Prisma.Decimal(0),
      paymentFrequency: 'ONE_TIME',
    } as any);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: 'wallet-1', userId: 'user-1', scope: 'personal' } as any);

    await settlePersonDebtService.execute('person-1', baseData, 'user-1');

    expect(transactionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'income', personId: 'person-1' }),
      expect.anything(),
    );
  });

  it('should mention who actually paid in the description when paid_by is informed', async () => {
    vi.spyOn(personRepository, 'findById').mockResolvedValue({
      id: 'person-1',
      userId: 'user-1',
      name: 'Maria',
      theyOweMe: new Prisma.Decimal(150),
      iOweThem: new Prisma.Decimal(0),
      paymentFrequency: 'ONE_TIME',
    } as any);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: 'wallet-1', userId: 'user-1', scope: 'personal' } as any);

    await settlePersonDebtService.execute('person-1', { ...baseData, amount: 50, paid_by: 'Carlos' }, 'user-1');

    const createdArgs = (transactionRepository.create as any).mock.calls[0][0];
    expect(createdArgs.description).toBe('Recebimento parcial de Maria (pago por Carlos)');
    expect(createdArgs.personId).toBe('person-1');
  });

  it('should keep the default description when paid_by is not informed', async () => {
    vi.spyOn(personRepository, 'findById').mockResolvedValue({
      id: 'person-1',
      userId: 'user-1',
      name: 'Maria',
      theyOweMe: new Prisma.Decimal(150),
      iOweThem: new Prisma.Decimal(0),
      paymentFrequency: 'ONE_TIME',
    } as any);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: 'wallet-1', userId: 'user-1', scope: 'personal' } as any);

    await settlePersonDebtService.execute('person-1', baseData, 'user-1');

    const createdArgs = (transactionRepository.create as any).mock.calls[0][0];
    expect(createdArgs.description).toBe('Recebimento de Maria');
  });

  it('should not link the EXPENSE transaction to the person when I owe them', async () => {
    vi.spyOn(personRepository, 'findById').mockResolvedValue({
      id: 'person-1',
      userId: 'user-1',
      name: 'João',
      theyOweMe: new Prisma.Decimal(0),
      iOweThem: new Prisma.Decimal(900),
      paymentFrequency: 'ONE_TIME',
    } as any);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: 'wallet-1', userId: 'user-1', scope: 'personal' } as any);

    await settlePersonDebtService.execute('person-1', { ...baseData, direction: 'i_owe_them' }, 'user-1');

    const createdArgs = (transactionRepository.create as any).mock.calls[0][0];
    expect(createdArgs.personId).toBeUndefined();
  });

  it('should create an EXPENSE transaction and update both iOweThem and lastPaidPeriod for a MONTHLY person', async () => {
    vi.spyOn(personRepository, 'findById').mockResolvedValue({
      id: 'person-1',
      userId: 'user-1',
      name: 'João',
      theyOweMe: new Prisma.Decimal(0),
      iOweThem: new Prisma.Decimal(900),
      paymentFrequency: 'MONTHLY',
    } as any);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: 'wallet-1', userId: 'user-1', scope: 'personal' } as any);

    await settlePersonDebtService.execute('person-1', { ...baseData, direction: 'i_owe_them' }, 'user-1');

    expect(transactionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'expense' }),
      expect.anything(),
    );
    expect(personRepository.update).toHaveBeenCalledWith(
      'person-1',
      { iOweThem: 0, lastPaidPeriod: expect.any(String) },
      expect.anything(),
    );
  });

  it('should decrement iOweThem by the partial amount for a MONTHLY person, keeping lastPaidPeriod updated', async () => {
    vi.spyOn(personRepository, 'findById').mockResolvedValue({
      id: 'person-1',
      userId: 'user-1',
      name: 'João',
      theyOweMe: new Prisma.Decimal(0),
      iOweThem: new Prisma.Decimal(900),
      paymentFrequency: 'MONTHLY',
    } as any);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: 'wallet-1', userId: 'user-1', scope: 'personal' } as any);

    await settlePersonDebtService.execute('person-1', { ...baseData, direction: 'i_owe_them', amount: 300 }, 'user-1');

    expect(personRepository.update).toHaveBeenCalledWith(
      'person-1',
      { iOweThem: 600, lastPaidPeriod: expect.any(String) },
      expect.anything(),
    );
  });

  it('should assign an invoiceId when the settlement wallet is a credit card', async () => {
    vi.spyOn(personRepository, 'findById').mockResolvedValue({
      id: 'person-1',
      userId: 'user-1',
      name: 'Maria',
      theyOweMe: new Prisma.Decimal(150),
      iOweThem: new Prisma.Decimal(0),
      paymentFrequency: 'ONE_TIME',
    } as any);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: 'wallet-1', userId: 'user-1', scope: 'personal', type: 'credit', closingDay: 5, dueDay: 15 } as any);

    await settlePersonDebtService.execute('person-1', baseData, 'user-1');

    expect(invoiceRepository.findOrCreate).toHaveBeenCalled();
    expect(transactionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ invoiceId: 'invoice-1' }),
      expect.anything(),
    );
  });

  it('should settle a partial amount and keep the remaining balance on theyOweMe', async () => {
    vi.spyOn(personRepository, 'findById').mockResolvedValue({
      id: 'person-1',
      userId: 'user-1',
      name: 'Maria',
      theyOweMe: new Prisma.Decimal(150),
      iOweThem: new Prisma.Decimal(0),
      paymentFrequency: 'ONE_TIME',
    } as any);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: 'wallet-1', userId: 'user-1', scope: 'personal' } as any);

    await settlePersonDebtService.execute('person-1', { ...baseData, amount: 50 }, 'user-1');

    const createdArgs = (transactionRepository.create as any).mock.calls[0][0];
    expect(new Prisma.Decimal(createdArgs.amount).toNumber()).toBe(50);
    expect(personRepository.update).toHaveBeenCalledWith('person-1', { theyOweMe: 100 }, expect.anything());
  });

  it('should throw AppError when the given amount is greater than the pending balance', async () => {
    vi.spyOn(personRepository, 'findById').mockResolvedValue({
      id: 'person-1',
      userId: 'user-1',
      name: 'Maria',
      theyOweMe: new Prisma.Decimal(150),
      iOweThem: new Prisma.Decimal(0),
      paymentFrequency: 'ONE_TIME',
    } as any);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: 'wallet-1', userId: 'user-1', scope: 'personal' } as any);

    await expect(settlePersonDebtService.execute('person-1', { ...baseData, amount: 200 }, 'user-1')).rejects.toBeInstanceOf(AppError);
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });

  it('should throw AppError when there is nothing pending in the given direction', async () => {
    vi.spyOn(personRepository, 'findById').mockResolvedValue({
      id: 'person-1',
      userId: 'user-1',
      theyOweMe: new Prisma.Decimal(0),
      iOweThem: new Prisma.Decimal(0),
      paymentFrequency: 'ONE_TIME',
    } as any);

    await expect(settlePersonDebtService.execute('person-1', baseData, 'user-1')).rejects.toBeInstanceOf(AppError);
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });

  it('should throw AppError when the person belongs to another user', async () => {
    vi.spyOn(personRepository, 'findById').mockResolvedValue({ id: 'person-1', userId: 'other-user' } as any);

    await expect(settlePersonDebtService.execute('person-1', baseData, 'user-1')).rejects.toBeInstanceOf(AppError);
  });

  it('should throw AppError when the wallet does not belong to the actor', async () => {
    vi.spyOn(personRepository, 'findById').mockResolvedValue({
      id: 'person-1',
      userId: 'user-1',
      theyOweMe: new Prisma.Decimal(150),
      iOweThem: new Prisma.Decimal(0),
      paymentFrequency: 'ONE_TIME',
    } as any);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: 'wallet-1', userId: 'other-user', scope: 'personal' } as any);

    await expect(settlePersonDebtService.execute('person-1', baseData, 'user-1')).rejects.toBeInstanceOf(AppError);
  });

  describe('receipt on a credit card wallet', () => {
    const creditWallet = { id: 'wallet-1', userId: 'user-1', scope: 'personal', type: 'credit', closingDay: 15, dueDay: 22 };
    const invoiceSummaries = [
      { id: 'inv-sep', referenceMonth: '2026-09', remainingAmount: 400 },
      { id: 'inv-oct', referenceMonth: '2026-10', remainingAmount: 800 },
      { id: 'inv-nov', referenceMonth: '2026-11', remainingAmount: 0 },
    ];

    beforeEach(() => {
      vi.spyOn(personRepository, 'findById').mockResolvedValue({
        id: 'person-1',
        userId: 'user-1',
        name: 'Maria',
        theyOweMe: new Prisma.Decimal(5000),
        iOweThem: new Prisma.Decimal(0),
        paymentFrequency: 'ONE_TIME',
      } as any);
      vi.spyOn(walletRepository, 'findById').mockResolvedValue(creditWallet as any);
      vi.spyOn(listWalletInvoicesService, 'execute').mockResolvedValue(invoiceSummaries as any);
    });

    it('should split the receipt across invoices in order, starting at the selected one', async () => {
      const result = await settlePersonDebtService.execute(
        'person-1',
        { ...baseData, amount: 1000, invoice_id: 'inv-sep' },
        'user-1',
      );

      const created = (transactionRepository.create as any).mock.calls.map((call: any[]) => call[0]);
      expect(created).toHaveLength(2);
      expect(created[0]).toMatchObject({ invoiceId: 'inv-sep', type: 'income', personId: 'person-1' });
      expect(created[0].amount.toNumber()).toBe(400);
      expect(created[0].description).toBe('Recebimento parcial de Maria (fatura 2026-09)');
      expect(created[1]).toMatchObject({ invoiceId: 'inv-oct', type: 'income', personId: 'person-1' });
      expect(created[1].amount.toNumber()).toBe(600);
      expect(created[1].description).toBe('Recebimento parcial de Maria (fatura 2026-10)');
      expect((result as any).transactions).toHaveLength(2);
    });

    it('should raise the wallet balance and lower the person debt only once, by the total', async () => {
      await settlePersonDebtService.execute('person-1', { ...baseData, amount: 1000, invoice_id: 'inv-sep' }, 'user-1');

      expect(walletRepository.update).toHaveBeenCalledTimes(1);
      const [, walletData] = (walletRepository.update as any).mock.calls[0];
      expect(walletData.balance.increment.toNumber()).toBe(1000);

      expect(personRepository.update).toHaveBeenCalledTimes(1);
      expect(personRepository.update).toHaveBeenCalledWith('person-1', { theyOweMe: 4000 }, expect.anything());
    });

    it('should keep a single transaction without invoice suffix when one invoice absorbs everything', async () => {
      await settlePersonDebtService.execute('person-1', { ...baseData, amount: 300, invoice_id: 'inv-sep' }, 'user-1');

      const created = (transactionRepository.create as any).mock.calls.map((call: any[]) => call[0]);
      expect(created).toHaveLength(1);
      expect(created[0].invoiceId).toBe('inv-sep');
      expect(created[0].description).toBe('Recebimento parcial de Maria');
    });

    it('should start at the oldest invoice with a pending balance when none is selected', async () => {
      await settlePersonDebtService.execute('person-1', { ...baseData, amount: 500 }, 'user-1');

      const created = (transactionRepository.create as any).mock.calls.map((call: any[]) => call[0]);
      expect(created.map((c: any) => c.invoiceId)).toEqual(['inv-sep', 'inv-oct']);
    });

    it('should fall back to the invoice of the receipt date when no invoice has a pending balance', async () => {
      vi.spyOn(listWalletInvoicesService, 'execute').mockResolvedValue([
        { id: 'inv-sep', referenceMonth: '2026-09', remainingAmount: 0 },
      ] as any);

      await settlePersonDebtService.execute('person-1', { ...baseData, amount: 100 }, 'user-1');

      expect(invoiceRepository.findOrCreate).toHaveBeenCalled();
      const created = (transactionRepository.create as any).mock.calls.map((call: any[]) => call[0]);
      expect(created).toHaveLength(1);
      expect(created[0].invoiceId).toBe('invoice-1');
    });

    it('should throw 404 when the selected invoice does not belong to the wallet', async () => {
      await expect(
        settlePersonDebtService.execute('person-1', { ...baseData, invoice_id: 'inv-other' }, 'user-1'),
      ).rejects.toMatchObject({ status_code: 404 });
      expect(transactionRepository.create).not.toHaveBeenCalled();
    });
  });

  it('should throw 422 when an invoice is informed for a wallet that is not a credit card', async () => {
    vi.spyOn(personRepository, 'findById').mockResolvedValue({
      id: 'person-1',
      userId: 'user-1',
      name: 'Maria',
      theyOweMe: new Prisma.Decimal(150),
      iOweThem: new Prisma.Decimal(0),
      paymentFrequency: 'ONE_TIME',
    } as any);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: 'wallet-1', userId: 'user-1', scope: 'personal', type: 'checking' } as any);

    await expect(
      settlePersonDebtService.execute('person-1', { ...baseData, invoice_id: '11111111-1111-4111-8111-111111111111' }, 'user-1'),
    ).rejects.toMatchObject({ status_code: 422 });
  });

  it('should throw 422 when an invoice is informed while paying a debt of mine', async () => {
    vi.spyOn(personRepository, 'findById').mockResolvedValue({
      id: 'person-1',
      userId: 'user-1',
      name: 'João',
      theyOweMe: new Prisma.Decimal(0),
      iOweThem: new Prisma.Decimal(900),
      paymentFrequency: 'ONE_TIME',
    } as any);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: 'wallet-1', userId: 'user-1', scope: 'personal', type: 'credit' } as any);

    await expect(
      settlePersonDebtService.execute('person-1', { ...baseData, direction: 'i_owe_them', invoice_id: '11111111-1111-4111-8111-111111111111' }, 'user-1'),
    ).rejects.toMatchObject({ status_code: 422 });
  });
});
