import {z} from 'zod';

export const createEmployeeSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().optional(),
  position: z.string().optional(),
  salary: z.number(),
  start_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  status: z.string(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();
