import { z } from 'zod';
import { TransactionTypeEnum } from '../enums/TransactionTypeEnum';
import { TransactionStatusEnum } from '../enums/TransactionStatusEnum';

export const UpdateTransactionDTO = z.object({
  category_id: z.string().uuid('ID da categoria inválido').optional(),
  type: z.nativeEnum(TransactionTypeEnum).optional(),
  amount: z.number().positive('O valor deve ser maior que zero').optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TransactionStatusEnum).optional(),
  occurred_at: z.string().datetime().or(z.date()).optional(),
  cost_center_id: z.string().uuid('ID do centro de custo inválido').nullable().optional(),
  person_id: z.string().uuid('ID da pessoa inválido').nullable().optional(),
});

export type UpdateTransactionDTOType = z.infer<typeof UpdateTransactionDTO>;
