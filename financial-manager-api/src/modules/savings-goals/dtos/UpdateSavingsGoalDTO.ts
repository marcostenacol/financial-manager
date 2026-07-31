import { z } from 'zod';

export const UpdateSavingsGoalDTO = z.object({
  name: z.string().min(3).max(50).optional(),
  target_amount: z.number().positive().optional(),
  current_amount: z.number().min(0).optional(),
  deadline: z.string().datetime().optional().nullable(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().optional().nullable(),
});

export type UpdateSavingsGoalDTOType = z.infer<typeof UpdateSavingsGoalDTO>;
