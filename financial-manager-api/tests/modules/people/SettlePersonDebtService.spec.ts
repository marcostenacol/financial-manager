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
import { CacheTrait } from '@/base/traits/CacheTrait';
import { AppError } from '@/shared/errors/AppError';
import { Prisma } from '@prisma/client';

describe('SettlePersonDebtService', () => {
  let personRepository: PersonRepositoryInterface;
  let transactionRepository: TransactionRepositoryInterface;
  let walletRepository: WalletRepositoryInterface;
  let categoryRepository: CategoryRepositoryInterface;
  let invoiceRepository: InvoiceRepositoryInterface;
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
});
