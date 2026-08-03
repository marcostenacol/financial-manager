import { z } from 'zod';

export const UpdateCostCenterDTO = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
});

export type UpdateCostCenterDTOType = z.infer<typeof UpdateCostCenterDTO>;
