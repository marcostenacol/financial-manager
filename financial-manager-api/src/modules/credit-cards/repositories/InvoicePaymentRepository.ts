import { InvoicePayment, Prisma } from '@prisma/client';
import { injectable } from 'tsyringe';
import { prisma } from '@/shared/database/PrismaClient';
import { InvoicePaymentRepositoryInterface } from './contracts/InvoicePaymentRepositoryInterface';

@injectable()
export class InvoicePaymentRepository implements InvoicePaymentRepositoryInterface {
  async create(data: Prisma.InvoicePaymentUncheckedCreateInput): Promise<InvoicePayment> {
    return prisma.invoicePayment.create({ data });
  }

  async findAllByInvoiceId(invoiceId: string): Promise<InvoicePayment[]> {
    return prisma.invoicePayment.findMany({
      where: { invoiceId },
      orderBy: { paidAt: 'desc' },
    });
  }

  async findAllByInvoiceIds(invoiceIds: string[]): Promise<InvoicePayment[]> {
    return prisma.invoicePayment.findMany({
      where: { invoiceId: { in: invoiceIds } },
      orderBy: { paidAt: 'desc' },
    });
  }

  async findById(id: string): Promise<InvoicePayment | null> {
    return prisma.invoicePayment.findUnique({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await prisma.invoicePayment.delete({ where: { id } });
  }
}
