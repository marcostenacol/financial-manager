import { inject, injectable } from 'tsyringe';
import { Prisma, Recurrence } from '@prisma/client';
import { prisma } from '@/shared/database/PrismaClient';
import { RecurrenceRepositoryInterface } from '../repositories/contracts/RecurrenceRepositoryInterface';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { TransactionStatusEnum } from '@/modules/transactions/enums/TransactionStatusEnum';
import { TransactionTypeEnum } from '@/modules/transactions/enums/TransactionTypeEnum';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { resolveOwnerKey } from '@/shared/lib/resolveOwnerKey';

@injectable()
export class ProcessRecurrenceService {
  constructor(
    @inject('RecurrenceRepository')
    private recurrenceRepository: RecurrenceRepositoryInterface,

    @inject('TransactionRepository')
    private transactionRepository: TransactionRepositoryInterface,

    @inject('WalletRepository')
    private walletRepository: WalletRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(): Promise<void> {
    const recurrences = await this.recurrenceRepository.findAllActive();
    const now = new Date();

    for (const recurrence of recurrences) {
      if (this.shouldProcess(recurrence, now)) {
        await this.process(recurrence, now);
      }
    }
  }

  /** Processa uma única recorrência agora, ignorando `shouldProcess` — usado pelo disparo manual. */
  async runNow(recurrence: Recurrence): Promise<void> {
    await this.process(recurrence, new Date());
  }

  private shouldProcess(recurrence: Recurrence, now: Date): boolean {
    const lastProcessed = recurrence.lastProcessedAt || recurrence.startsAt;
    const diffTime = now.getTime() - lastProcessed.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    switch (recurrence.period) {
      case 'daily':
        return diffDays >= 1;
      case 'weekly':
        return diffDays >= 7;
      case 'monthly':
        // Simplificação: 30 dias. Para precisão maior, usar diffMonths
        return diffDays >= 30;
      case 'yearly':
        return diffDays >= 365;
      default:
        return false;
    }
  }

  private async process(recurrence: Recurrence, now: Date): Promise<void> {
    const wallet = await this.walletRepository.findById(recurrence.walletId);

    const balanceDelta = recurrence.type === TransactionTypeEnum.INCOME
      ? new Prisma.Decimal(recurrence.amount)
      : new Prisma.Decimal(recurrence.amount).negated();

    await prisma.$transaction(async (tx) => {
      // 1. Criar transação
      await this.transactionRepository.create({
        description: `${recurrence.description} (Recorrente)`,
        amount: recurrence.amount,
        type: recurrence.type as TransactionTypeEnum,
        status: TransactionStatusEnum.COMPLETED,
        walletId: recurrence.walletId,
        categoryId: recurrence.categoryId,
        recurrenceId: recurrence.id,
        occurredAt: now,
      }, tx);

      // 2. Atualizar saldo da carteira
      if (wallet) {
        await this.walletRepository.update(wallet.id, {
          balance: { increment: balanceDelta },
        }, tx);
      }

      // 3. Atualizar última data de processamento
      await this.recurrenceRepository.update(recurrence.id, {
        lastProcessedAt: now,
      }, tx);
    });

    if (wallet) {
      const ownerKey = resolveOwnerKey(wallet);
      await this.cache.delPattern(CacheKeys.wallets.listPattern(ownerKey));
      await this.cache.del(CacheKeys.wallets.detail(wallet.id));
      await this.cache.delPattern(CacheKeys.transactions.listPattern(ownerKey));
      await this.cache.delPattern(CacheKeys.transactions.byWalletPattern(wallet.id));
      await this.cache.delPattern(CacheKeys.reports.overviewPattern(ownerKey));
      await this.cache.del(CacheKeys.reports.monthlyEvolution(ownerKey));
      await this.cache.delPattern(CacheKeys.reports.expensesByCategoryPattern(ownerKey));
    }
  }
}
