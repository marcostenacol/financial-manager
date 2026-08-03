import { z } from 'zod';

export const CreateCostCenterDTO = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default('#3b82f6'),
});

export type CreateCostCenterDTOType = z.infer<typeof CreateCostCenterDTO>;
