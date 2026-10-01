import { z } from 'zod';

export const ReportDateRangeDTO = z
  .object({
    start_date: z.string().datetime().or(z.string().date()).optional(),
    end_date: z.string().datetime().or(z.string().date()).optional(),
  })
  .refine(
    (data) => !data.start_date || !data.end_date || new Date(data.end_date) >= new Date(data.start_date),
    {
      message: 'A data final não pode ser anterior à data inicial',
      path: ['end_date'],
    },
  );

export type ReportDateRangeDTOType = z.infer<typeof ReportDateRangeDTO>;
