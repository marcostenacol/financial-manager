import { Wallet, Prisma } from '@prisma/client';
import { WalletTypeEnum } from '@/modules/wallets/enums/WalletTypeEnum';
import { InvoiceRepositoryInterface } from '../repositories/contracts/InvoiceRepositoryInterface';
import { computeInvoicePeriod } from './computeInvoicePeriod';

export async function resolveInvoiceId(
  wallet: Pick<Wallet, 'id' | 'type' | 'closingDay' | 'dueDay'>,
  occurredAt: Date,
  invoiceRepository: InvoiceRepositoryInterface,
  tx: Prisma.TransactionClient,
): Promise<string | undefined> {
  if (wallet.type !== WalletTypeEnum.CREDIT) return undefined;

  const period = computeInvoicePeriod(occurredAt, wallet.closingDay ?? 1, wallet.dueDay ?? 10);
  const invoice = await invoiceRepository.findOrCreate(wallet.id, period, tx);
  return invoice.id;
}
