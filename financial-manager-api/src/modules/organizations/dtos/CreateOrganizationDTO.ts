import { z } from 'zod';

export const CreateOrganizationDTO = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
});

export type CreateOrganizationDTOType = z.infer<typeof CreateOrganizationDTO>;
