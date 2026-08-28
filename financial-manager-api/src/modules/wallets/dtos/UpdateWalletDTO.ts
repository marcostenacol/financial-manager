import { z } from 'zod';
import { ProfileScope } from '@prisma/client';
import { WalletTypeEnum } from '../enums/WalletTypeEnum';

export const UpdateWalletDTO = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres').optional(),
  type: z.nativeEnum(WalletTypeEnum).optional(),
  scope: z.nativeEnum(ProfileScope).optional(),
  balance: z.number().optional(),
  currency: z.string().optional(),
  closing_day: z.number().int().min(1).max(31).nullable().optional(),
  due_day: z.number().int().min(1).max(31).nullable().optional(),
});

export type UpdateWalletDTOType = z.infer<typeof UpdateWalletDTO>;
