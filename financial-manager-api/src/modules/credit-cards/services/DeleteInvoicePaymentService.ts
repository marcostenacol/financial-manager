import { inject, injectable } from 'tsyringe';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { InvoiceRepositoryInterface } from '../repositories/contracts/InvoiceRepositoryInterface';
import { InvoicePaymentRepositoryInterface } from '../repositories/contracts/InvoicePaymentRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';
import { isOwnedByActor } from '@/shared/authorization/ownership';

@injectable()
export class DeleteInvoicePaymentService {
  constructor(
    @inject('WalletRepository')
    private walletRepository: WalletRepositoryInterface,

    @inject('InvoiceRepository')
    private invoiceRepository: InvoiceRepositoryInterface,

    @inject('InvoicePaymentRepository')
    private invoicePaymentRepository: InvoicePaymentRepositoryInterface,
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

    await this.invoicePaymentRepository.delete(paymentId);
  }
}
