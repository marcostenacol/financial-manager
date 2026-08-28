import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do Prisma antes dos imports que o utilizam
vi.mock('@/shared/database/PrismaClient', () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback({})),
  },
}));

import { CreateTransactionService } from '@/modules/transactions/services/CreateTransactionService';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { CategoryRepositoryInterface } from '@/modules/categories/repositories/contracts/CategoryRepositoryInterface';
import { CostCenterRepositoryInterface } from '@/modules/cost-centers/repositories/contracts/CostCenterRepositoryInterface';
import { PersonRepositoryInterface } from '@/modules/people/repositories/contracts/PersonRepositoryInterface';
import { InvoiceRepositoryInterface } from '@/modules/credit-cards/repositories/contracts/InvoiceRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { TransactionTypeEnum } from '@/modules/transactions/enums/TransactionTypeEnum';
import { TransactionStatusEnum } from '@/modules/transactions/enums/TransactionStatusEnum';
import { Prisma } from '@prisma/client';

describe('CreateTransactionService', () => {
  let transactionRepository: TransactionRepositoryInterface;
  let walletRepository: WalletRepositoryInterface;
  let categoryRepository: CategoryRepositoryInterface;
  let costCenterRepository: CostCenterRepositoryInterface;
  let personRepository: PersonRepositoryInterface;
  let invoiceRepository: InvoiceRepositoryInterface;
  let cacheTrait: CacheTrait;
  let createTransactionService: CreateTransactionService;

  beforeEach(() => {
    transactionRepository = {
      create: vi.fn(),
    } as any;

    walletRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    } as any;

    categoryRepository = {
      findById: vi.fn().mockResolvedValue({ id: 'category-1', scope: null }),
    } as any;

    costCenterRepository = {
      findById: vi.fn(),
    } as any;

    personRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    } as any;

    invoiceRepository = {
      findOrCreate: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
      delPattern: vi.fn(),
    } as any;

    createTransactionService = new CreateTransactionService(
      transactionRepository,
      walletRepository,
      categoryRepository,
      costCenterRepository,
      personRepository,
      invoiceRepository,
      cacheTrait,
    );
  });

  it('should create a transaction and update wallet balance for income', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    const data = {
      description: 'Salário',
      amount: 1000,
      type: TransactionTypeEnum.INCOME,
      status: TransactionStatusEnum.COMPLETED,
      wallet_id: walletId,
      occurred_at: '2024-05-01',
    };

    const wallet = { id: walletId, userId, balance: 500, scope: 'personal' };
    vi.spyOn(walletRepository, 'findById').mockResolvedValue(wallet as any);
    vi.spyOn(transactionRepository, 'create').mockResolvedValue({ id: 'tx-1', ...data, amount: 1000 } as any);

    const result = await createTransactionService.execute(data as any, userId);

    expect(result).toHaveProperty('id');
    expect(walletRepository.update).toHaveBeenCalledWith(
      walletId,
      { balance: { increment: new Prisma.Decimal(1000) } },
      expect.anything(),
    );
    expect(cacheTrait.del).toHaveBeenCalled();
  });

  it('should create a transaction and update wallet balance for expense', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    const data = {
      description: 'Aluguel',
      amount: 200,
      type: TransactionTypeEnum.EXPENSE,
      status: TransactionStatusEnum.COMPLETED,
      wallet_id: walletId,
      occurred_at: '2024-05-01',
    };

    const wallet = { id: walletId, userId, balance: 500, scope: 'personal' };
    vi.spyOn(walletRepository, 'findById').mockResolvedValue(wallet as any);
    vi.spyOn(transactionRepository, 'create').mockResolvedValue({ id: 'tx-2', ...data, amount: 200 } as any);

    const result = await createTransactionService.execute(data as any, userId);

    expect(result).toHaveProperty('id');
    expect(walletRepository.update).toHaveBeenCalledWith(
      walletId,
      { balance: { increment: new Prisma.Decimal(200).negated() } },
      expect.anything(),
    );
  });

  it('should not update balance if status is pending', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    const data = {
      description: 'Compra Pendente',
      amount: 100,
      type: TransactionTypeEnum.EXPENSE,
      status: TransactionStatusEnum.PENDING,
      wallet_id: walletId,
      occurred_at: '2024-05-01',
    };

    const wallet = { id: walletId, userId, balance: 500, scope: 'personal' };
    vi.spyOn(walletRepository, 'findById').mockResolvedValue(wallet as any);
    vi.spyOn(transactionRepository, 'create').mockResolvedValue({ id: 'tx-3', ...data, amount: 100 } as any);

    await createTransactionService.execute(data as any, userId);

    expect(walletRepository.update).not.toHaveBeenCalled();
  });

  it('should reject a category whose scope is incompatible with the wallet scope', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    const data = {
      description: 'Fornecedor',
      amount: 300,
      type: TransactionTypeEnum.EXPENSE,
      status: TransactionStatusEnum.COMPLETED,
      wallet_id: walletId,
      category_id: 'category-1',
      occurred_at: '2024-05-01',
    };

    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: walletId, userId, balance: 500, scope: 'personal' } as any);
    vi.spyOn(categoryRepository, 'findById').mockResolvedValue({ id: 'category-1', scope: 'business' } as any);

    await expect(createTransactionService.execute(data as any, userId)).rejects.toThrow(
      'Esta categoria não é compatível com o escopo da carteira',
    );
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });

  it('should reject a cost center on a personal wallet', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    const data = {
      description: 'Fornecedor',
      amount: 300,
      type: TransactionTypeEnum.EXPENSE,
      status: TransactionStatusEnum.COMPLETED,
      wallet_id: walletId,
      category_id: 'category-1',
      cost_center_id: 'cc-1',
      occurred_at: '2024-05-01',
    };

    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: walletId, userId, balance: 500, scope: 'personal' } as any);

    await expect(createTransactionService.execute(data as any, userId)).rejects.toThrow(
      'Centro de custo só pode ser usado em carteiras empresariais',
    );
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });

  it('should increase the linked person theyOweMe when creating a completed expense with person_id', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    const data = {
      description: 'Compra no cartão da Maria',
      amount: 150,
      type: TransactionTypeEnum.EXPENSE,
      status: TransactionStatusEnum.COMPLETED,
      wallet_id: walletId,
      person_id: 'person-1',
      occurred_at: '2024-05-01',
    };

    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: walletId, userId, balance: 500, scope: 'personal' } as any);
    vi.spyOn(personRepository, 'findById').mockResolvedValue({ id: 'person-1', userId, scope: 'personal' } as any);
    vi.spyOn(transactionRepository, 'create').mockResolvedValue({ id: 'tx-4', ...data } as any);

    await createTransactionService.execute(data as any, userId);

    expect(personRepository.update).toHaveBeenCalledWith(
      'person-1',
      { theyOweMe: { increment: new Prisma.Decimal(150) } },
      expect.anything(),
    );
  });

  it('should reject person_id on an income transaction', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    const data = {
      description: 'Salário',
      amount: 1000,
      type: TransactionTypeEnum.INCOME,
      status: TransactionStatusEnum.COMPLETED,
      wallet_id: walletId,
      person_id: 'person-1',
      occurred_at: '2024-05-01',
    };

    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: walletId, userId, balance: 500, scope: 'personal' } as any);

    await expect(createTransactionService.execute(data as any, userId)).rejects.toThrow(
      'Só é possível vincular uma pessoa a uma despesa',
    );
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });

  it('should split an installment purchase into N transactions with the total preserved', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    const data = {
      description: 'TV nova',
      amount: 1000,
      type: TransactionTypeEnum.EXPENSE,
      status: TransactionStatusEnum.COMPLETED,
      wallet_id: walletId,
      occurred_at: '2024-05-01T00:00:00.000Z',
      installments: 3,
    };

    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: walletId, userId, balance: 500, scope: 'personal' } as any);
    vi.spyOn(transactionRepository, 'create').mockImplementation(async (input: any) => ({ id: 'tx-x', ...input }) as any);

    const result = await createTransactionService.execute(data as any, userId) as any[];

    expect(result).toHaveLength(3);
    const created = (transactionRepository.create as any).mock.calls.map((call: any[]) => call[0]);
    const total = created.reduce((sum: number, c: any) => sum + Number(c.amount), 0);
    expect(total).toBeCloseTo(1000, 2);
    expect(created[0].description).toBe('TV nova (1/3)');
    expect(created[0].status).toBe(TransactionStatusEnum.COMPLETED);
    expect(created[1].status).toBe(TransactionStatusEnum.PENDING);
    expect(created[2].status).toBe(TransactionStatusEnum.PENDING);

    // Só a primeira parcela (completed) afeta o saldo da carteira
    expect(walletRepository.update).toHaveBeenCalledTimes(1);
  });

  it('should divide non-exact totals into installments without losing cents', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    const data = {
      description: 'Compra',
      amount: 100,
      type: TransactionTypeEnum.EXPENSE,
      status: TransactionStatusEnum.COMPLETED,
      wallet_id: walletId,
      occurred_at: '2024-05-01T00:00:00.000Z',
      installments: 3,
    };

    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: walletId, userId, balance: 500, scope: 'personal' } as any);
    vi.spyOn(transactionRepository, 'create').mockImplementation(async (input: any) => ({ id: 'tx-x', ...input }) as any);

    await createTransactionService.execute(data as any, userId);

    const created = (transactionRepository.create as any).mock.calls.map((call: any[]) => call[0]);
    const amounts = created.map((c: any) => Number(c.amount));
    expect(amounts[0]).toBeCloseTo(33.33, 2);
    expect(amounts[1]).toBeCloseTo(33.33, 2);
    expect(amounts[2]).toBeCloseTo(33.34, 2);
    expect(amounts.reduce((a: number, b: number) => a + b, 0)).toBeCloseTo(100, 2);
  });

  it('assigns the transaction to the right invoice when the wallet is a credit card', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    const data = {
      description: 'Compra no cartão',
      amount: 200,
      type: TransactionTypeEnum.EXPENSE,
      status: TransactionStatusEnum.COMPLETED,
      wallet_id: walletId,
      occurred_at: '2026-08-10T00:00:00.000Z',
    };

    vi.spyOn(walletRepository, 'findById').mockResolvedValue({
      id: walletId, userId, scope: 'personal', type: 'credit', closingDay: 5, dueDay: 15,
    } as any);
    vi.spyOn(invoiceRepository, 'findOrCreate').mockResolvedValue({ id: 'invoice-1' } as any);
    vi.spyOn(transactionRepository, 'create').mockImplementation(async (input: any) => ({ id: 'tx-1', ...input }) as any);

    await createTransactionService.execute(data as any, userId);

    expect(invoiceRepository.findOrCreate).toHaveBeenCalledWith(
      walletId,
      expect.objectContaining({ referenceMonth: '2026-09' }),
      expect.anything(),
    );
    const created = (transactionRepository.create as any).mock.calls[0][0];
    expect(created.invoiceId).toBe('invoice-1');
  });

  it('does not assign an invoice for non-credit wallets', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    const data = {
      description: 'Compra no débito',
      amount: 50,
      type: TransactionTypeEnum.EXPENSE,
      status: TransactionStatusEnum.COMPLETED,
      wallet_id: walletId,
      occurred_at: '2026-08-10T00:00:00.000Z',
    };

    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: walletId, userId, scope: 'personal', type: 'checking' } as any);
    vi.spyOn(transactionRepository, 'create').mockImplementation(async (input: any) => ({ id: 'tx-2', ...input }) as any);

    await createTransactionService.execute(data as any, userId);

    expect(invoiceRepository.findOrCreate).not.toHaveBeenCalled();
    const created = (transactionRepository.create as any).mock.calls[0][0];
    expect(created.invoiceId).toBeUndefined();
  });
});
