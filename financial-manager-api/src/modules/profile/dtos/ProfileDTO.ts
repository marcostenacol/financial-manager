import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  bio: z.string().max(255).optional(),
});

export const ChangeProfileTypeSchema = z.object({
  type: z.enum(['personal', 'business']),
});
