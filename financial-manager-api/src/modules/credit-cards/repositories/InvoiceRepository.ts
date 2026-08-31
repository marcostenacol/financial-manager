import { Invoice, Prisma } from '@prisma/client';
import { injectable } from 'tsyringe';
import { prisma } from '@/shared/database/PrismaClient';
import { InvoiceRepositoryInterface } from './contracts/InvoiceRepositoryInterface';
import { InvoicePeriod } from '../utils/computeInvoicePeriod';

@injectable()
export class InvoiceRepository implements InvoiceRepositoryInterface {
  async findOrCreate(walletId: string, period: InvoicePeriod, tx?: Prisma.TransactionClient): Promise<Invoice> {
    const client = tx ?? prisma;
    return client.invoice.upsert({
      where: { walletId_referenceMonth: { walletId, referenceMonth: period.referenceMonth } },
      update: { closingDate: period.closingDate, dueDate: period.dueDate },
      create: {
        walletId,
        referenceMonth: period.referenceMonth,
        closingDate: period.closingDate,
        dueDate: period.dueDate,
      },
    });
  }

  async findById(id: string): Promise<Invoice | null> {
    return prisma.invoice.findUnique({ where: { id } });
  }

  async findAllByWalletId(walletId: string): Promise<Invoice[]> {
    return prisma.invoice.findMany({
      where: { walletId },
      orderBy: { referenceMonth: 'asc' },
    });
  }
}
