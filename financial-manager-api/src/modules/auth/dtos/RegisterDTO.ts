import { z } from 'zod';

export const RegisterDTO = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  type: z.enum(['personal', 'business']).default('personal'),
});

export type RegisterDTOType = z.infer<typeof RegisterDTO>;
