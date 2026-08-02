import { z } from 'zod';

export const ClearAllTransactionsDTO = z.object({
  reset_balances: z.boolean().default(false),
});

export type ClearAllTransactionsDTOType = z.infer<typeof ClearAllTransactionsDTO>;
