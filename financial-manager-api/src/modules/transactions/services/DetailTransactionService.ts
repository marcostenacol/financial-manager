import { inject, injectable } from 'tsyringe';
import { Transaction } from '@prisma/client';
import { TransactionRepositoryInterface } from '../repositories/contracts/TransactionRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { isOwnedByActor } from '@/shared/authorization/ownership';

interface TransactionWithWallet extends Transaction {
  wallet?: { userId: string | null; organizationId: string | null } | null;
}

@injectable()
export class DetailTransactionService {
  constructor(
    @inject('TransactionRepository')
    private transactionRepository: TransactionRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(id: string, userId: string, organizationIds: string[] = []): Promise<Transaction> {
    const cacheKey = CacheKeys.transactions.detail(id);

    const cached = await this.cache.get<TransactionWithWallet>(cacheKey);
    if (cached) {
      if (!cached.wallet || !isOwnedByActor(cached.wallet, userId, organizationIds)) {
        throw new AppError('Acesso negado', 403);
      }
      return cached;
    }

    const transaction = await this.transactionRepository.findById(id) as TransactionWithWallet | null;

    if (!transaction) {
      throw new AppError('Transação não encontrada', 404);
    }

    // Verifica se a carteira da transação pertence ao usuário ou a uma organização da qual ele é membro
    // O repository já faz o include do wallet
    if (!transaction.wallet || !isOwnedByActor(transaction.wallet, userId, organizationIds)) {
      throw new AppError('Acesso negado', 403);
    }

    await this.cache.set(cacheKey, transaction);

    return transaction;
  }
}
