import { z } from 'zod';

export const TransferOwnershipDTO = z.object({
  user_id: z.string().uuid('ID do usuário inválido'),
});

export type TransferOwnershipDTOType = z.infer<typeof TransferOwnershipDTO>;
