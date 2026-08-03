import { z } from 'zod';
import { TransactionTypeEnum } from '../enums/TransactionTypeEnum';
import { TransactionStatusEnum } from '../enums/TransactionStatusEnum';

export const CreateTransactionDTO = z.object({
  wallet_id: z.string().uuid('ID da carteira inválido'),
  category_id: z.string().uuid('ID da categoria inválido'),
  type: z.nativeEnum(TransactionTypeEnum),
  amount: z.number().positive('O valor deve ser maior que zero'),
  description: z.string().optional(),
  status: z.nativeEnum(TransactionStatusEnum).default(TransactionStatusEnum.COMPLETED),
  occurred_at: z.string().datetime().or(z.date()).default(() => new Date()),
  cost_center_id: z.string().uuid('ID do centro de custo inválido').optional(),
});

export type CreateTransactionDTOType = z.infer<typeof CreateTransactionDTO>;
