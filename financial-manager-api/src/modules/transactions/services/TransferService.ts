import { inject, injectable } from 'tsyringe';
import { CreateTransferDTOType } from '../dtos/CreateTransferDTO';
import { TransactionRepositoryInterface } from '../repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { TransactionTypeEnum } from '../enums/TransactionTypeEnum';
import { TransactionStatusEnum } from '../enums/TransactionStatusEnum';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { prisma } from '@/shared/database/PrismaClient';

@injectable()
export class TransferService {
  constructor(
    @inject('TransactionRepository')
    private transactionRepository: TransactionRepositoryInterface,

    @inject('WalletRepository')
    private walletRepository: WalletRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(data: CreateTransferDTOType, userId: string): Promise<void> {
    const { source_wallet_id, destination_wallet_id, amount, description, occurred_at, category_id } = data;

    // 1. Validar posse das carteiras
    const [sourceWallet, destinationWallet] = await Promise.all([
      this.walletRepository.findById(source_wallet_id),
      this.walletRepository.findById(destination_wallet_id),
    ]);

    if (!sourceWallet || sourceWallet.userId !== userId) {
      throw new Error('Carteira de origem não encontrada ou acesso negado');
    }

    if (!destinationWallet || destinationWallet.userId !== userId) {
      throw new Error('Carteira de destino não encontrada ou acesso negado');
    }

    if (source_wallet_id === destination_wallet_id) {
      throw new Error('As carteiras de origem e destino devem ser diferentes');
    }

    const date = occurred_at ? new Date(occurred_at) : new Date();

    // 2. Executar transação atômica
    await prisma.$transaction(async (tx) => {
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
    await Promise.all([
      this.cache.delPattern(CacheKeys.transactions.listPattern(userId)),
      this.cache.del(CacheKeys.wallets.list(userId)),
      this.cache.delPattern(CacheKeys.reports.overviewPattern(userId)),
    ]);
  }
}
