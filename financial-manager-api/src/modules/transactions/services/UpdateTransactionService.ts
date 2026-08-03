import { inject, injectable } from 'tsyringe';
import { Transaction, Prisma, ProfileScope } from '@prisma/client';
import { prisma } from '@/shared/database/PrismaClient';
import { TransactionRepositoryInterface } from '../repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { CategoryRepositoryInterface } from '@/modules/categories/repositories/contracts/CategoryRepositoryInterface';
import { CostCenterRepositoryInterface } from '@/modules/cost-centers/repositories/contracts/CostCenterRepositoryInterface';
import { UpdateTransactionDTOType } from '../dtos/UpdateTransactionDTO';
import { AppError } from '@/shared/errors/AppError';
import { TransactionStatusEnum } from '../enums/TransactionStatusEnum';
import { TransactionTypeEnum } from '../enums/TransactionTypeEnum';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class UpdateTransactionService {
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

  async execute(id: string, data: UpdateTransactionDTOType, userId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new AppError('Transação não encontrada', 404);
    }

    const wallet = await this.walletRepository.findById(transaction.walletId);

    if (!wallet || wallet.userId !== userId) {
      throw new AppError('Acesso negado', 403);
    }

    if (data.category_id) {
      const category = await this.categoryRepository.findById(data.category_id);

      if (!category) {
        throw new AppError('Categoria não encontrada', 404);
      }

      if (category.scope && category.scope !== wallet.scope) {
        throw new AppError('Esta categoria não é compatível com o escopo da carteira', 422);
      }
    }

    if (data.cost_center_id) {
      if (wallet.scope !== ProfileScope.business) {
        throw new AppError('Centro de custo só pode ser usado em carteiras empresariais', 422);
      }

      const costCenter = await this.costCenterRepository.findById(data.cost_center_id);

      if (!costCenter || costCenter.userId !== userId) {
        throw new AppError('Centro de custo não encontrado', 404);
      }
    }

    const wasCompleted = transaction.status === TransactionStatusEnum.COMPLETED;
    const oldSignedAmount = transaction.type === TransactionTypeEnum.INCOME
      ? new Prisma.Decimal(transaction.amount)
      : new Prisma.Decimal(transaction.amount).negated();

    const newType = data.type ?? transaction.type;
    const newAmount = data.amount !== undefined ? new Prisma.Decimal(data.amount) : new Prisma.Decimal(transaction.amount);
    const newStatus = data.status ?? transaction.status;
    const willBeCompleted = newStatus === TransactionStatusEnum.COMPLETED;
    const newSignedAmount = newType === TransactionTypeEnum.INCOME ? newAmount : newAmount.negated();

    // Delta líquido: remove o impacto antigo (se estava concluída) e aplica o novo (se ficará concluída)
    const balanceDelta = (willBeCompleted ? newSignedAmount : new Prisma.Decimal(0))
      .minus(wasCompleted ? oldSignedAmount : new Prisma.Decimal(0));

    const updatedTransaction = await prisma.$transaction(async (tx) => {
      const updated = await this.transactionRepository.update(id, {
        description: data.description,
        amount: data.amount,
        type: data.type,
        status: data.status,
        categoryId: data.category_id,
        occurredAt: data.occurred_at ? new Date(data.occurred_at) : undefined,
        costCenterId: data.cost_center_id,
      }, tx);

      if (!balanceDelta.isZero()) {
        await this.walletRepository.update(wallet.id, {
          balance: { increment: balanceDelta },
        }, tx);
      }

      return updated;
    });

    // Invalida caches (incluindo listagens filtradas)
    await this.cache.del(CacheKeys.wallets.detail(wallet.id));
    await this.cache.delPattern(CacheKeys.wallets.listPattern(userId));
    await this.cache.del(CacheKeys.transactions.detail(id));
    await this.cache.delPattern(CacheKeys.transactions.listPattern(userId));
    await this.cache.delPattern(CacheKeys.transactions.byWalletPattern(wallet.id));
    await this.cache.delPattern(CacheKeys.reports.overviewPattern(userId));
    await this.cache.del(CacheKeys.reports.monthlyEvolution(userId));
    await this.cache.delPattern(CacheKeys.reports.expensesByCategoryPattern(userId));
    await this.cache.delPattern(CacheKeys.reports.cashFlowByCostCenterPattern(userId));

    return updatedTransaction;
  }
}
