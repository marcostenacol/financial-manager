import { z } from 'zod';
import { WalletTypeEnum } from '../enums/WalletTypeEnum';

export const UpdateWalletDTO = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres').optional(),
  type: z.nativeEnum(WalletTypeEnum).optional(),
  balance: z.number().optional(),
  currency: z.string().optional(),
});

export type UpdateWalletDTOType = z.infer<typeof UpdateWalletDTO>;
