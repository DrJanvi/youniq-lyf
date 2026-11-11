import { z } from "zod";

const optionalErrorMetadata = z
  .string()
  .nullish()
  .transform((value) => value ?? undefined);

export const razorpayPaymentSchema = z.object({
  id: z.string().min(1),
  order_id: z.string().min(1),
  amount: z.number().int().positive(),
  currency: z.string().min(3).max(3),
  status: z.string().min(1),
  captured: z.boolean().optional(),
  error_code: optionalErrorMetadata,
  error_description: optionalErrorMetadata,
});

export type RazorpayPayment = z.infer<typeof razorpayPaymentSchema>;
