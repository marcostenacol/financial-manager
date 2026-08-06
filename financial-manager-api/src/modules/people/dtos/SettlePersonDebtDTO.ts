import { z } from 'zod';

export const SettlePersonDebtDTO = z.object({
  direction: z.enum(['they_owe_me', 'i_owe_them']),
  wallet_id: z.string().uuid('ID da carteira inválido'),
  category_id: z.string().uuid('ID da categoria inválido'),
});

export type SettlePersonDebtDTOType = z.infer<typeof SettlePersonDebtDTO>;
