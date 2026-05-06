import { z } from 'zod';

export const UpdateCategorySchema = z.object({
  name: z.string().min(3).max(50).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().optional(),
  type: z.enum(['income', 'expense', 'both']).optional(),
});

export type IUpdateCategoryDTO = z.infer<typeof UpdateCategorySchema>;
