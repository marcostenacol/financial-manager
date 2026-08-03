import { z } from 'zod';

export const MoveWalletToOrganizationDTO = z.object({
  organization_id: z.string().uuid('ID da organização inválido'),
});

export type MoveWalletToOrganizationDTOType = z.infer<typeof MoveWalletToOrganizationDTO>;
