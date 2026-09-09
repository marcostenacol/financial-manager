import { z } from 'zod';

export const RegisterInvoicePaymentDTO = z.object({
  amount: z.number().positive('O valor do pagamento deve ser maior que zero'),
  paid_at: z.string().datetime().or(z.date()).optional(),
  note: z.string().optional(),
});

export type RegisterInvoicePaymentDTOType = z.infer<typeof RegisterInvoicePaymentDTO>;
