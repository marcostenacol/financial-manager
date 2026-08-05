import { z } from 'zod';

export const ClearAllTransactionsDTO = z.object({
  reset_balances: z.boolean().default(false),
  organization_id: z.string().uuid('ID da organização inválido').optional(),
});

export type ClearAllTransactionsDTOType = z.infer<typeof ClearAllTransactionsDTO>;
