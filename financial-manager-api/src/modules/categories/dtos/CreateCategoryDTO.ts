import { z } from 'zod';

export const CreateCategoryDTO = z.object({
  name: z.string().min(2),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  icon: z.string().optional(),
  type: z.enum(['income', 'expense', 'both']),
});

export type CreateCategoryDTOType = z.infer<typeof CreateCategoryDTO>;
