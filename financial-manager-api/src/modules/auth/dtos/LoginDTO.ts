import { z } from 'zod';

export const LoginDTO = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type LoginDTOType = z.infer<typeof LoginDTO>;
