import { z } from 'zod';

export const CreateTransferDTO = z.object({
  description: z.string().min(3).max(255),
  amount: z.number().positive(),
  source_wallet_id: z.string().uuid(),
  destination_wallet_id: z.string().uuid(),
  category_id: z.string().uuid(),
  occurred_at: z.string().datetime().optional(),
});

export type CreateTransferDTOType = z.infer<typeof CreateTransferDTO>;
