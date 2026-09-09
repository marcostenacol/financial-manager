import { inject, injectable } from 'tsyringe';
import { Prisma, Transaction, InvoicePayment } from '@prisma/client';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { InvoiceRepositoryInterface } from '../repositories/contracts/InvoiceRepositoryInterface';
import { InvoicePaymentRepositoryInterface } from '../repositories/contracts/InvoicePaymentRepositoryInterface';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { TransactionTypeEnum } from '@/modules/transactions/enums/TransactionTypeEnum';
import { computeInvoiceStatus, InvoiceStatus } from '../utils/computeInvoiceStatus';
import { AppError } from '@/shared/errors/AppError';
import { isOwnedByActor } from '@/shared/authorization/ownership';

export interface InvoiceDetailDTO {
  id: string;
  referenceMonth: string;
  closingDate: Date;
  dueDate: Date;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: InvoiceStatus;
  transactions: Transaction[];
  payments: InvoicePayment[];
}

@injectable()
export class GetInvoiceDetailService {
  constructor(
    @inject('WalletRepository')
    private walletRepository: WalletRepositoryInterface,

    @inject('InvoiceRepository')
    private invoiceRepository: InvoiceRepositoryInterface,

    @inject('InvoicePaymentRepository')
    private invoicePaymentRepository: InvoicePaymentRepositoryInterface,

    @inject('TransactionRepository')
    private transactionRepository: TransactionRepositoryInterface,
  ) {}

  async execute(walletId: string, invoiceId: string, userId: string, organizationIds: string[] = []): Promise<InvoiceDetailDTO> {
    const wallet = await this.walletRepository.findById(walletId);

    if (!wallet || !isOwnedByActor(wallet, userId, organizationIds)) {
      throw new AppError('Carteira não encontrada', 404);
    }

    const invoice = await this.invoiceRepository.findById(invoiceId);

    if (!invoice || invoice.walletId !== walletId) {
      throw new AppError('Fatura não encontrada', 404);
    }

    const [transactions, payments] = await Promise.all([
      this.transactionRepository.findAllByInvoiceId(invoice.id),
      this.invoicePaymentRepository.findAllByInvoiceId(invoice.id),
    ]);

    const totalAmount = transactions.reduce((sum, t) => {
      const amount = new Prisma.Decimal(t.amount);
      return t.type === TransactionTypeEnum.INCOME ? sum.minus(amount) : sum.plus(amount);
    }, new Prisma.Decimal(0));

    const paidAmount = payments.reduce((sum, p) => sum.plus(new Prisma.Decimal(p.amount)), new Prisma.Decimal(0));

    return {
      id: invoice.id,
      referenceMonth: invoice.referenceMonth,
      closingDate: invoice.closingDate,
      dueDate: invoice.dueDate,
      totalAmount: totalAmount.toNumber(),
      paidAmount: paidAmount.toNumber(),
      remainingAmount: totalAmount.minus(paidAmount).toNumber(),
      status: computeInvoiceStatus(totalAmount, paidAmount, invoice.closingDate),
      transactions,
      payments,
    };
  }
}
