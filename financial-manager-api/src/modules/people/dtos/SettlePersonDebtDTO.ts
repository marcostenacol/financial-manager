import { z } from 'zod';

export const SettlePersonDebtDTO = z.object({
  direction: z.enum(['they_owe_me', 'i_owe_them']),
  wallet_id: z.string().uuid('ID da carteira inválido'),
  category_id: z.string().uuid('ID da categoria inválido'),
  amount: z.number().positive('O valor deve ser maior que zero').optional(),
  invoice_id: z.string().uuid('ID da fatura inválido').optional(),
  paid_by: z.string().trim().min(1).max(80).optional(),
});

export type SettlePersonDebtDTOType = z.infer<typeof SettlePersonDebtDTO>;
