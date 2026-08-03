import { z } from 'zod';
import { ProfileScope } from '@prisma/client';

export const CreateCategoryDTO = z.object({
  name: z.string().min(2),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  icon: z.string().optional(),
  type: z.enum(['income', 'expense', 'both']),
  scope: z.nativeEnum(ProfileScope).optional(),
  organization_id: z.string().uuid('ID da organização inválido').optional(),
});

export type CreateCategoryDTOType = z.infer<typeof CreateCategoryDTO>;
