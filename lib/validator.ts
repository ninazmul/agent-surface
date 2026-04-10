import * as z from "zod";

export const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  date: z.string().min(1, "Date is required."), // Now required
  email: z.string().email("Invalid email format.").optional(),
});

