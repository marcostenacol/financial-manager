import { z } from 'zod';
import { WalletTypeEnum } from '../enums/WalletTypeEnum';

export const CreateWalletDTO = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  type: z.nativeEnum(WalletTypeEnum).default(WalletTypeEnum.PERSONAL),
  balance: z.number().default(0),
  currency: z.string().default('BRL'),
});

export type CreateWalletDTOType = z.infer<typeof CreateWalletDTO>;
