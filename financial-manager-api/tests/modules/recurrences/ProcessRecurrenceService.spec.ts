import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do Prisma antes dos imports que o utilizam
vi.mock('@/shared/database/PrismaClient', () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback({})),
  },
}));

import { Prisma } from '@prisma/client';
import { ProcessRecurrenceService } from '@/modules/recurrences/services/ProcessRecurrenceService';
import { RecurrenceRepositoryInterface } from '@/modules/recurrences/repositories/contracts/RecurrenceRepositoryInterface';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { InvoiceRepositoryInterface } from '@/modules/credit-cards/repositories/contracts/InvoiceRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('ProcessRecurrenceService', () => {
  let recurrenceRepository: RecurrenceRepositoryInterface;
  let transactionRepository: TransactionRepositoryInterface;
  let walletRepository: WalletRepositoryInterface;
  let invoiceRepository: InvoiceRepositoryInterface;
  let cacheTrait: CacheTrait;
  let processRecurrenceService: ProcessRecurrenceService;

  beforeEach(() => {
    recurrenceRepository = {
      findAllActive: vi.fn(),
      findById: vi.fn().mockResolvedValue({ isActive: true }),
      update: vi.fn(),
    } as any;

    transactionRepository = {
      create: vi.fn(),
    } as any;

    walletRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    } as any;

    invoiceRepository = {
      findOrCreate: vi.fn().mockResolvedValue({ id: 'invoice-1' }),
    } as any;

    cacheTrait = {
      del: vi.fn(),
      delPattern: vi.fn(),
    } as any;

    processRecurrenceService = new ProcessRecurrenceService(
      recurrenceRepository,
      transactionRepository,
      walletRepository,
      invoiceRepository,
      cacheTrait
    );
  });

  it('should process a monthly recurrence that was never processed', async () => {
    const startsAt = new Date();
    startsAt.setDate(startsAt.getDate() - 31); // 31 dias atrás

    const recurrence = {
      id: 'rec-1',
      description: 'Netflix',
      amount: 50,
      type: 'expense',
      period: 'monthly',
      startsAt,
      lastProcessedAt: null,
      walletId: 'wallet-1',
      categoryId: 'cat-1',
    };

    const wallet = { id: 'wallet-1', userId: 'user-1', balance: 1000 };

    vi.spyOn(recurrenceRepository, 'findAllActive').mockResolvedValue([recurrence as any]);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue(wallet as any);

    await processRecurrenceService.execute();

    expect(transactionRepository.create).toHaveBeenCalled();
    expect(walletRepository.update).toHaveBeenCalledWith(
      'wallet-1',
      { balance: { increment: new Prisma.Decimal(50).negated() } },
      expect.anything(),
    );
    expect(recurrenceRepository.update).toHaveBeenCalledWith('rec-1', expect.objectContaining({
      lastProcessedAt: expect.any(Date)
    }), expect.anything());
  });

  it('should assign an invoiceId when the wallet is a credit card', async () => {
    const startsAt = new Date();
    startsAt.setDate(startsAt.getDate() - 31);

    const recurrence = {
      id: 'rec-1',
      description: 'Netflix',
      amount: 50,
      type: 'expense',
      period: 'monthly',
      startsAt,
      lastProcessedAt: null,
      walletId: 'wallet-1',
      categoryId: 'cat-1',
    };

    const wallet = { id: 'wallet-1', userId: 'user-1', balance: 1000, type: 'credit', closingDay: 5, dueDay: 15 };

    vi.spyOn(recurrenceRepository, 'findAllActive').mockResolvedValue([recurrence as any]);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue(wallet as any);

    await processRecurrenceService.execute();

    expect(invoiceRepository.findOrCreate).toHaveBeenCalled();
    expect(transactionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ invoiceId: 'invoice-1' }),
      expect.anything(),
    );
  });

  it('should not process a recurrence that was recently processed', async () => {
    // Ancorado em startsAt (não em "N dias após lastProcessedAt"): criada e processada
    // há só 15 dias, então o próximo vencimento mensal ainda não chegou.
    const startsAt = new Date();
    startsAt.setDate(startsAt.getDate() - 15);

    const recurrence = {
      id: 'rec-1',
      period: 'monthly',
      startsAt,
      lastProcessedAt: startsAt,
    };

    vi.spyOn(recurrenceRepository, 'findAllActive').mockResolvedValue([recurrence as any]);

    await processRecurrenceService.execute();

    expect(transactionRepository.create).not.toHaveBeenCalled();
  });

  it('should not drift the due day forward across consecutive monthly cycles', async () => {
    // Regressão do bug de drift: antes, "30 dias após o último processamento" empurrava
    // o dia de vencimento pra frente a cada ciclo. Agora due é sempre recalculado a
    // partir de startsAt, então o dia (clampado no fim do mês) nunca muda.
    const startsAt = new Date(2026, 0, 1); // 1º de janeiro de 2026

    const firstCycle = {
      id: 'rec-1',
      description: 'Netflix',
      amount: 50,
      type: 'expense',
      period: 'monthly',
      startsAt,
      lastProcessedAt: null,
      walletId: 'wallet-1',
      categoryId: 'cat-1',
    };

    const wallet = { id: 'wallet-1', userId: 'user-1', balance: 1000 };
    vi.spyOn(walletRepository, 'findById').mockResolvedValue(wallet as any);

    // "Agora" = 1º de fevereiro (exatamente 1 mês depois) — deve processar.
    vi.spyOn(recurrenceRepository, 'findAllActive').mockResolvedValue([firstCycle as any]);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 1, 1));

    await processRecurrenceService.execute();
    expect(transactionRepository.create).toHaveBeenCalledTimes(1);

    // Simula o "lastProcessedAt" real gravado nesse primeiro ciclo (processado no dia certo).
    const secondCycle = { ...firstCycle, lastProcessedAt: new Date(2026, 1, 1) };
    vi.spyOn(recurrenceRepository, 'findAllActive').mockResolvedValue([secondCycle as any]);

    // Um dia antes do próximo vencimento (1º de março) — não deve processar de novo.
    vi.setSystemTime(new Date(2026, 1, 28));
    await processRecurrenceService.execute();
    expect(transactionRepository.create).toHaveBeenCalledTimes(1);

    // No dia certo (1º de março) — processa, sem ter indevidamente escorregado pra frente.
    vi.setSystemTime(new Date(2026, 2, 1));
    await processRecurrenceService.execute();
    expect(transactionRepository.create).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it('should skip a recurrence that was deactivated between the batch fetch and processing', async () => {
    const startsAt = new Date();
    startsAt.setDate(startsAt.getDate() - 31);

    const recurrence = {
      id: 'rec-1',
      description: 'Netflix',
      amount: 50,
      type: 'expense',
      period: 'monthly',
      startsAt,
      lastProcessedAt: null,
      walletId: 'wallet-1',
      categoryId: 'cat-1',
    };

    vi.spyOn(recurrenceRepository, 'findAllActive').mockResolvedValue([recurrence as any]);
    vi.spyOn(recurrenceRepository, 'findById').mockResolvedValue({ isActive: false } as any);

    await processRecurrenceService.execute();

    expect(transactionRepository.create).not.toHaveBeenCalled();
    expect(recurrenceRepository.update).not.toHaveBeenCalled();
  });
});
