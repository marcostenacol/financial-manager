import { z } from 'zod';
import { OrganizationMemberRoleEnum } from '../enums/OrganizationMemberRoleEnum';

export const CreateInviteDTO = z.object({
  role: z.nativeEnum(OrganizationMemberRoleEnum).default(OrganizationMemberRoleEnum.MEMBER),
  max_uses: z.number().int().positive().optional(),
  expires_in_days: z.number().int().min(1, 'A validade mínima é de 1 dia').max(30, 'A validade máxima é de 30 dias'),
});

export type CreateInviteDTOType = z.infer<typeof CreateInviteDTO>;
