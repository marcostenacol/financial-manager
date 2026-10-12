import { inject, injectable } from 'tsyringe';
import { prisma } from '@/shared/database/PrismaClient';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { InvoiceRepositoryInterface } from '../repositories/contracts/InvoiceRepositoryInterface';
import { InvoicePaymentRepositoryInterface } from '../repositories/contracts/InvoicePaymentRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';
import { isOwnedByActor } from '@/shared/authorization/ownership';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { resolveOwnerKey } from '@/shared/lib/resolveOwnerKey';

@injectable()
export class DeleteInvoicePaymentService {
  constructor(
    @inject('WalletRepository')
    private walletRepository: WalletRepositoryInterface,

    @inject('InvoiceRepository')
    private invoiceRepository: InvoiceRepositoryInterface,

    @inject('InvoicePaymentRepository')
    private invoicePaymentRepository: InvoicePaymentRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(walletId: string, invoiceId: string, paymentId: string, userId: string, organizationIds: string[] = []): Promise<void> {
    const wallet = await this.walletRepository.findById(walletId);

    if (!wallet || !isOwnedByActor(wallet, userId, organizationIds)) {
      throw new AppError('Carteira não encontrada', 404);
    }

    const invoice = await this.invoiceRepository.findById(invoiceId);

    if (!invoice || invoice.walletId !== walletId) {
      throw new AppError('Fatura não encontrada', 404);
    }

    const payment = await this.invoicePaymentRepository.findById(paymentId);

    if (!payment || payment.invoiceId !== invoiceId) {
      throw new AppError('Pagamento não encontrado', 404);
    }

    await prisma.$transaction(async (tx) => {
      await this.invoicePaymentRepository.delete(paymentId, tx);
      await this.walletRepository.update(walletId, { balance: { decrement: payment.amount } }, tx);
    });

    await this.cache.del(CacheKeys.wallets.detail(walletId));
    if (wallet.organizationId) {
      await this.cache.delPattern(CacheKeys.wallets.listAllPattern());
    } else {
      await this.cache.delPattern(CacheKeys.wallets.listPattern(resolveOwnerKey(wallet)));
    }
  }
}
