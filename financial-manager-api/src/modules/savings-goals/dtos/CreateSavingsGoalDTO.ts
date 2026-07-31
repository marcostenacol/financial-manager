import { z } from 'zod';

export const CreateSavingsGoalDTO = z.object({
  name: z.string().min(3).max(50),
  target_amount: z.number().positive(),
  current_amount: z.number().min(0).optional().default(0),
  deadline: z.string().datetime().optional().nullable(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional().default('#3b82f6'),
  icon: z.string().optional().nullable(),
});

export type CreateSavingsGoalDTOType = z.infer<typeof CreateSavingsGoalDTO>;
