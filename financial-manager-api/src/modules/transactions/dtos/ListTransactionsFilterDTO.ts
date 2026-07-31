import { z } from 'zod';

export const ListTransactionsFilterDTO = z.object({
  wallet_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

export type ListTransactionsFilterDTOType = z.infer<typeof ListTransactionsFilterDTO>;
