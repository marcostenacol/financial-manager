import { z } from 'zod';
import { ProfileScope } from '@prisma/client';

export const UpdateCategoryDTO = z.object({
  name: z.string().min(3).max(50).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().optional(),
  type: z.enum(['income', 'expense', 'both']).optional(),
  scope: z.nativeEnum(ProfileScope).optional(),
});

export type UpdateCategoryDTOType = z.infer<typeof UpdateCategoryDTO>;
