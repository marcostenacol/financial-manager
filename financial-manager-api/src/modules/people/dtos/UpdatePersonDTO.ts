import { z } from 'zod';
import { PixKeyType, PaymentFrequency } from '@prisma/client';

export const UpdatePersonDTO = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres').optional(),
  they_owe_me: z.number().nonnegative('O valor não pode ser negativo').optional(),
  i_owe_them: z.number().nonnegative('O valor não pode ser negativo').optional(),
  payment_frequency: z.nativeEnum(PaymentFrequency).optional(),
  pix_key: z.string().min(1, 'A chave PIX é obrigatória').optional(),
  pix_key_type: z.nativeEnum(PixKeyType).optional(),
  pix_city: z.string().optional(),
  notes: z.string().optional(),
});

export type UpdatePersonDTOType = z.infer<typeof UpdatePersonDTO>;
