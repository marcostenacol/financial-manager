import { inject, injectable } from 'tsyringe';
import { InvoicePayment, Prisma } from '@prisma/client';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { InvoiceRepositoryInterface } from '../repositories/contracts/InvoiceRepositoryInterface';
import { InvoicePaymentRepositoryInterface } from '../repositories/contracts/InvoicePaymentRepositoryInterface';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { TransactionTypeEnum } from '@/modules/transactions/enums/TransactionTypeEnum';
import { RegisterInvoicePaymentDTOType } from '../dtos/RegisterInvoicePaymentDTO';
import { AppError } from '@/shared/errors/AppError';
import { isOwnedByActor } from '@/shared/authorization/ownership';

@injectable()
export class RegisterInvoicePaymentService {
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

  async execute(
    walletId: string,
    invoiceId: string,
    data: RegisterInvoicePaymentDTOType,
    userId: string,
    organizationIds: string[] = [],
  ): Promise<InvoicePayment> {
    const wallet = await this.walletRepository.findById(walletId);

    if (!wallet || !isOwnedByActor(wallet, userId, organizationIds)) {
      throw new AppError('Carteira não encontrada', 404);
    }

    const invoice = await this.invoiceRepository.findById(invoiceId);

    if (!invoice || invoice.walletId !== walletId) {
      throw new AppError('Fatura não encontrada', 404);
    }

    if (data.amount <= 0) {
      throw new AppError('O valor do pagamento deve ser maior que zero', 422);
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

    const remainingAmount = totalAmount.minus(paidAmount);

    if (new Prisma.Decimal(data.amount).greaterThan(remainingAmount)) {
      throw new AppError('O valor informado é maior que o saldo pendente da fatura', 422);
    }

    return this.invoicePaymentRepository.create({
      invoiceId,
      amount: new Prisma.Decimal(data.amount),
      paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
      note: data.note,
    });
  }
}
