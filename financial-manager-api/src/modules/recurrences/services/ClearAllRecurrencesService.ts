import { inject, injectable } from 'tsyringe';
import { prisma } from '@/shared/database/PrismaClient';
import { RecurrenceRepositoryInterface } from '../repositories/contracts/RecurrenceRepositoryInterface';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class ClearAllRecurrencesService {
  constructor(
    @inject('RecurrenceRepository')
    private recurrenceRepository: RecurrenceRepositoryInterface,

    @inject('TransactionRepository')
    private transactionRepository: TransactionRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(userId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Desvincula as transações já geradas em vez de apagá-las — cancelar
      // recorrências não deve destruir o histórico de lançamentos.
      await this.transactionRepository.nullifyRecurrenceForUser(userId, tx);
      await this.recurrenceRepository.deleteAllByUserId(userId, tx);
    });

    await this.cache.del(CacheKeys.recurrences.list(userId));
  }
}
