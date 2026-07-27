import { z } from 'zod';

// Not exposed over HTTP: used internally by other modules to enqueue a
// notification for a specific user (e.g. a recurrence being processed).
export const CreateNotificationDTO = z.object({
  title: z.string().min(2),
  message: z.string().min(2),
  type: z.enum(['info', 'warning', 'success', 'error']).default('info'),
});

export type CreateNotificationDTOType = z.infer<typeof CreateNotificationDTO>;
