import { inject, injectable } from 'tsyringe';
import { Prisma, Transaction, ProfileScope } from '@prisma/client';
import { prisma } from '@/shared/database/PrismaClient';
import { TransactionRepositoryInterface } from '../repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { CategoryRepositoryInterface } from '@/modules/categories/repositories/contracts/CategoryRepositoryInterface';
import { CostCenterRepositoryInterface } from '@/modules/cost-centers/repositories/contracts/CostCenterRepositoryInterface';
import { CreateTransactionDTOType } from '../dtos/CreateTransactionDTO';
import { AppError } from '@/shared/errors/AppError';
import { TransactionStatusEnum } from '../enums/TransactionStatusEnum';
import { TransactionTypeEnum } from '../enums/TransactionTypeEnum';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class CreateTransactionService {
  constructor(
    @inject('TransactionRepository')
    private transactionRepository: TransactionRepositoryInterface,

    @inject('WalletRepository')
    private walletRepository: WalletRepositoryInterface,

    @inject('CategoryRepository')
    private categoryRepository: CategoryRepositoryInterface,

    @inject('CostCenterRepository')
    private costCenterRepository: CostCenterRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(data: CreateTransactionDTOType, userId: string): Promise<Transaction> {
    const wallet = await this.walletRepository.findById(data.wallet_id);

    if (!wallet || wallet.userId !== userId) {
      throw new AppError('Carteira não encontrada', 404);
    }

    const category = await this.categoryRepository.findById(data.category_id);

    if (!category) {
      throw new AppError('Categoria não encontrada', 404);
    }

    if (category.scope && category.scope !== wallet.scope) {
      throw new AppError('Esta categoria não é compatível com o escopo da carteira', 422);
    }

    if (data.cost_center_id && wallet.scope !== ProfileScope.business) {
      throw new AppError('Centro de custo só pode ser usado em carteiras empresariais', 422);
    }

    if (data.cost_center_id) {
      const costCenter = await this.costCenterRepository.findById(data.cost_center_id);

      if (!costCenter || costCenter.userId !== userId) {
        throw new AppError('Centro de custo não encontrado', 404);
      }
    }

    const amount = new Prisma.Decimal(data.amount);
    const isCompleted = data.status === TransactionStatusEnum.COMPLETED;
    const balanceDelta = data.type === TransactionTypeEnum.INCOME ? amount : amount.negated();

    const transaction = await prisma.$transaction(async (tx) => {
      const createdTransaction = await this.transactionRepository.create({
        walletId: data.wallet_id,
        categoryId: data.category_id,
        type: data.type,
        amount,
        description: data.description,
        status: data.status,
        occurredAt: new Date(data.occurred_at),
        costCenterId: data.cost_center_id,
      }, tx);

      if (isCompleted) {
        await this.walletRepository.update(wallet.id, {
          balance: { increment: balanceDelta },
        }, tx);
      }

      return createdTransaction;
    });

    if (isCompleted) {
      // Invalida cache da carteira e lista de carteiras
      await this.cache.del(CacheKeys.wallets.detail(wallet.id));
      await this.cache.delPattern(CacheKeys.wallets.listPattern(userId));
    }

    // Invalida cache de transações
    await this.cache.del(CacheKeys.transactions.byWallet(wallet.id));
    await this.cache.delPattern(CacheKeys.transactions.listPattern(userId));
    await this.cache.delPattern(CacheKeys.reports.overviewPattern(userId));
    await this.cache.del(CacheKeys.reports.monthlyEvolution(userId));
    await this.cache.delPattern(CacheKeys.reports.expensesByCategoryPattern(userId));
    await this.cache.delPattern(CacheKeys.reports.cashFlowByCostCenterPattern(userId));

    return transaction;
  }
}
