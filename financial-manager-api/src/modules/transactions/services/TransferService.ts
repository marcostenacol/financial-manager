import { inject, injectable } from 'tsyringe';
import { CreateTransferDTOType } from '../dtos/CreateTransferDTO';
import { TransactionRepositoryInterface } from '../repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { InvoiceRepositoryInterface } from '@/modules/credit-cards/repositories/contracts/InvoiceRepositoryInterface';
import { resolveInvoiceId } from '@/modules/credit-cards/utils/resolveInvoiceId';
import { TransactionTypeEnum } from '../enums/TransactionTypeEnum';
import { TransactionStatusEnum } from '../enums/TransactionStatusEnum';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { prisma } from '@/shared/database/PrismaClient';
import { AppError } from '@/shared/errors/AppError';
import { isOwnedByActor } from '@/shared/authorization/ownership';

@injectable()
export class TransferService {
  constructor(
    @inject('TransactionRepository')
    private transactionRepository: TransactionRepositoryInterface,

    @inject('WalletRepository')
    private walletRepository: WalletRepositoryInterface,

    @inject('InvoiceRepository')
    private invoiceRepository: InvoiceRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(data: CreateTransferDTOType, userId: string, organizationIds: string[] = []): Promise<void> {
    const { source_wallet_id, destination_wallet_id, amount, description, occurred_at, category_id } = data;

    // 1. Validar posse das carteiras
    const [sourceWallet, destinationWallet] = await Promise.all([
      this.walletRepository.findById(source_wallet_id),
      this.walletRepository.findById(destination_wallet_id),
    ]);

    if (!sourceWallet || !isOwnedByActor(sourceWallet, userId, organizationIds)) {
      throw new AppError('Carteira de origem não encontrada ou acesso negado', 404);
    }

    if (!destinationWallet || !isOwnedByActor(destinationWallet, userId, organizationIds)) {
      throw new AppError('Carteira de destino não encontrada ou acesso negado', 404);
    }

    if (source_wallet_id === destination_wallet_id) {
      throw new AppError('As carteiras de origem e destino devem ser diferentes', 422);
    }

    const date = occurred_at ? new Date(occurred_at) : new Date();

    // 2. Executar transação atômica
    await prisma.$transaction(async (tx) => {
      const sourceInvoiceId = await resolveInvoiceId(sourceWallet, date, this.invoiceRepository, tx);
      const destinationInvoiceId = await resolveInvoiceId(destinationWallet, date, this.invoiceRepository, tx);

      // Criar transação de saída
      await tx.transaction.create({
        data: {
          description: `Transferência para: ${destinationWallet.name}`,
          amount,
          type: TransactionTypeEnum.EXPENSE,
          status: TransactionStatusEnum.COMPLETED,
          walletId: source_wallet_id,
          categoryId: category_id,
          occurredAt: date,
          invoiceId: sourceInvoiceId,
        },
      });

      // Criar transação de entrada
      await tx.transaction.create({
        data: {
          description: `Transferência de: ${sourceWallet.name}`,
          amount,
          type: TransactionTypeEnum.INCOME,
          status: TransactionStatusEnum.COMPLETED,
          walletId: destination_wallet_id,
          categoryId: category_id,
          occurredAt: date,
          invoiceId: destinationInvoiceId,
        },
      });

      // Atualizar saldos
      await tx.wallet.update({
        where: { id: source_wallet_id },
        data: { balance: { decrement: amount } },
      });

      await tx.wallet.update({
        where: { id: destination_wallet_id },
        data: { balance: { increment: amount } },
      });
    });

    // 3. Limpar caches
    const walletsCachePattern = sourceWallet.organizationId || destinationWallet.organizationId
      ? CacheKeys.wallets.listAllPattern()
      : CacheKeys.wallets.listPattern(userId);

    await Promise.all([
      this.cache.delPattern(CacheKeys.transactions.listPattern(userId)),
      this.cache.delPattern(CacheKeys.transactions.byWalletPattern(source_wallet_id)),
      this.cache.delPattern(CacheKeys.transactions.byWalletPattern(destination_wallet_id)),
      this.cache.delPattern(walletsCachePattern),
      this.cache.del(CacheKeys.wallets.detail(source_wallet_id)),
      this.cache.del(CacheKeys.wallets.detail(destination_wallet_id)),
      this.cache.delPattern(CacheKeys.reports.overviewPattern(userId)),
      this.cache.del(CacheKeys.reports.monthlyEvolution(userId)),
      this.cache.delPattern(CacheKeys.reports.expensesByCategoryPattern(userId)),
    ]);
  }
}
