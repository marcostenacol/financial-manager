import { z } from 'zod';

export const ReportWalletFilterDTO = z.object({
  wallet_ids: z
    .string()
    .optional()
    .transform((value) => (value ? value.split(',').map((id) => id.trim()).filter(Boolean) : undefined))
    .pipe(z.array(z.string().uuid('ID de carteira inválido')).max(50, 'Máximo de 50 carteiras').optional()),
});

export type ReportWalletFilterDTOType = z.infer<typeof ReportWalletFilterDTO>;
