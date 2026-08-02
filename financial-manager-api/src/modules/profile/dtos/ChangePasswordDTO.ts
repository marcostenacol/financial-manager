import { z } from 'zod';

export const ChangePasswordDTO = z.object({
  current_password: z.string().min(1, 'Senha atual é obrigatória'),
  new_password: z.string().min(6, 'A nova senha deve ter no mínimo 6 caracteres'),
});

export type ChangePasswordDTOType = z.infer<typeof ChangePasswordDTO>;
