import { z } from 'zod';

export const CreateRecurrenceDTO = z.object({
  description: z.string().min(3),
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  wallet_id: z.string().uuid(),
  category_id: z.string().uuid(),
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime().optional(),
});

export type CreateRecurrenceDTOType = z.infer<typeof CreateRecurrenceDTO>;
