import { z } from 'zod';

export const noteSchema = z.object({
  title: z.string().min(1),
  content: z.string().max(2000),
});
