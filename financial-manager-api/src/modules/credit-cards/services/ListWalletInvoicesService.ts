import { inject, injectable } from 'tsyringe';
import { Prisma } from '@prisma/client';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { InvoiceRepositoryInterface } from '../repositories/contracts/InvoiceRepositoryInterface';
import { InvoicePaymentRepositoryInterface } from '../repositories/contracts/InvoicePaymentRepositoryInterface';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { TransactionTypeEnum } from '@/modules/transactions/enums/TransactionTypeEnum';
import { WalletTypeEnum } from '@/modules/wallets/enums/WalletTypeEnum';
import { computeInvoiceStatus, InvoiceStatus } from '../utils/computeInvoiceStatus';
import { AppError } from '@/shared/errors/AppError';
import { isOwnedByActor } from '@/shared/authorization/ownership';

export interface InvoiceSummaryDTO {
  id: string;
  referenceMonth: string;
  closingDate: Date;
  dueDate: Date;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: InvoiceStatus;
}

@injectable()
export class ListWalletInvoicesService {
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

  async execute(walletId: string, userId: string, organizationIds: string[] = []): Promise<InvoiceSummaryDTO[]> {
    const wallet = await this.walletRepository.findById(walletId);

    if (!wallet || !isOwnedByActor(wallet, userId, organizationIds)) {
      throw new AppError('Carteira não encontrada', 404);
    }

    if (wallet.type !== WalletTypeEnum.CREDIT) {
      throw new AppError('Esta carteira não é um cartão de crédito', 422);
    }

    const invoices = await this.invoiceRepository.findAllByWalletId(walletId);
    const invoiceIds = invoices.map((invoice) => invoice.id);

    const [allTransactions, allPayments] = await Promise.all([
      this.transactionRepository.findAllByInvoiceIds(invoiceIds),
      this.invoicePaymentRepository.findAllByInvoiceIds(invoiceIds),
    ]);

    const transactionsByInvoiceId = new Map<string, typeof allTransactions>();
    for (const transaction of allTransactions) {
      const invoiceId = transaction.invoiceId as string;
      const list = transactionsByInvoiceId.get(invoiceId) ?? [];
      list.push(transaction);
      transactionsByInvoiceId.set(invoiceId, list);
    }

    const paymentsByInvoiceId = new Map<string, typeof allPayments>();
    for (const payment of allPayments) {
      const list = paymentsByInvoiceId.get(payment.invoiceId) ?? [];
      list.push(payment);
      paymentsByInvoiceId.set(payment.invoiceId, list);
    }

    return invoices.map((invoice) => {
      const transactions = transactionsByInvoiceId.get(invoice.id) ?? [];
      const payments = paymentsByInvoiceId.get(invoice.id) ?? [];

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
      };
    });
  }
}
