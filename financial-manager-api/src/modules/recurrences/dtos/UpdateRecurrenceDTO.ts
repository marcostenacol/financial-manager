import { z } from 'zod';

export const UpdateRecurrenceDTO = z.object({
  description: z.string().min(3).optional(),
  amount: z.number().positive().optional(),
  type: z.enum(['income', 'expense']).optional(),
  category_id: z.string().uuid().optional(),
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  ends_at: z.string().datetime().nullable().optional(),
});

export type UpdateRecurrenceDTOType = z.infer<typeof UpdateRecurrenceDTO>;
