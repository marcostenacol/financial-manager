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
  const isDebt = !!source.personId
    && source.type === TransactionTypeEnum.EXPENSE
    && source.status !== TransactionStatusEnum.CANCELLED;

  return isDebt ? new Prisma.Decimal(source.amount) : new Prisma.Decimal(0);
}
