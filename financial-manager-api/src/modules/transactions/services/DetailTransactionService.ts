import { inject, injectable } from 'tsyringe';
import { Transaction } from '@prisma/client';
import { TransactionRepositoryInterface } from '../repositories/contracts/TransactionRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';

@injectable()
export class DetailTransactionService {
  constructor(
    @inject('TransactionRepository')
    private transactionRepository: TransactionRepositoryInterface,
  ) {}

  async execute(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new AppError('Transação não encontrada', 404);
    }

    // Verifica se a carteira da transação pertence ao usuário
    // O repository já faz o include do wallet
    if ((transaction as any).wallet?.userId !== userId) {
      throw new AppError('Acesso negado', 403);
    }

    return transaction;
  }
}
