import { z } from 'zod';

export const ChangeProfileTypeDTO = z.object({
  type: z.enum(['personal', 'business']),
});

export type ChangeProfileTypeDTOType = z.infer<typeof ChangeProfileTypeDTO>;
