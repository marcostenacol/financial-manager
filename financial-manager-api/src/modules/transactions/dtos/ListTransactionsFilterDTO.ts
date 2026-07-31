import { z } from 'zod';
import { TransactionTypeEnum } from '../enums/TransactionTypeEnum';

export const ListTransactionsFilterDTO = z.object({
  wallet_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  type: z.nativeEnum(TransactionTypeEnum).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().max(100).default(10),
});

export type ListTransactionsFilterDTOType = z.infer<typeof ListTransactionsFilterDTO>;
