import { InvoicePayment, Prisma } from '@prisma/client';

export interface InvoicePaymentRepositoryInterface {
  create(data: Prisma.InvoicePaymentUncheckedCreateInput): Promise<InvoicePayment>;
  findAllByInvoiceId(invoiceId: string): Promise<InvoicePayment[]>;
  findAllByInvoiceIds(invoiceIds: string[]): Promise<InvoicePayment[]>;
  findById(id: string): Promise<InvoicePayment | null>;
  delete(id: string): Promise<void>;
}
