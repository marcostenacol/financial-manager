import { z } from 'zod';

export const UpdateProfileDTO = z.object({
  name: z.string().min(3).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().optional(),
});

export type UpdateProfileDTOType = z.infer<typeof UpdateProfileDTO>;
