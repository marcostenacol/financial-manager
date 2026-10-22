import { Prisma } from '@prisma/client';
import { TransactionStatusEnum } from '../enums/TransactionStatusEnum';
import { TransactionTypeEnum } from '../enums/TransactionTypeEnum';

interface PersonDebtSource {
  type: string;
  status: string;
  personId: string | null | undefined;
  amount: Prisma.Decimal | number | string;
}

export function personDebtOf(source: PersonDebtSource): Prisma.Decimal {
  if (!source.personId || source.status === TransactionStatusEnum.CANCELLED) {
    return new Prisma.Decimal(0);
  }

  const amount = new Prisma.Decimal(source.amount);

  if (source.type === TransactionTypeEnum.EXPENSE) return amount;
  if (source.type === TransactionTypeEnum.INCOME) return amount.negated();

  return new Prisma.Decimal(0);
}
