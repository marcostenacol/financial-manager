import { Invoice, Prisma } from '@prisma/client';
import { InvoicePeriod } from '../../utils/computeInvoicePeriod';

export interface InvoiceRepositoryInterface {
  findOrCreate(walletId: string, period: InvoicePeriod, tx?: Prisma.TransactionClient): Promise<Invoice>;
  findById(id: string): Promise<Invoice | null>;
  findAllByWalletId(walletId: string): Promise<Invoice[]>;
}
