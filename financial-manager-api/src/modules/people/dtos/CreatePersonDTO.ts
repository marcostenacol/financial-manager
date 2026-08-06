import { z } from 'zod';
import { PixKeyType, PaymentFrequency, ProfileScope } from '@prisma/client';

export const CreatePersonDTO = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  they_owe_me: z.number().nonnegative('O valor não pode ser negativo').optional(),
  i_owe_them: z.number().nonnegative('O valor não pode ser negativo').optional(),
  payment_frequency: z.nativeEnum(PaymentFrequency).optional(),
  pix_key: z.string().min(1, 'A chave PIX é obrigatória'),
  pix_key_type: z.nativeEnum(PixKeyType),
  pix_city: z.string().optional(),
  notes: z.string().optional(),
  scope: z.nativeEnum(ProfileScope).optional(),
  organization_id: z.string().uuid('ID da organização inválido').optional(),
});

export type CreatePersonDTOType = z.infer<typeof CreatePersonDTO>;
