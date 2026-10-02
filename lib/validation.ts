import { z } from "zod";

export const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2, "Enter your full name").max(100),
  customer_email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20).regex(/^[+0-9()\-\s]+$/, "Use digits, spaces, + or - only"),
  delivery_address: z.string().trim().min(5, "Enter your delivery address").max(250),
  city: z.string().trim().min(2, "Enter your city").max(100),
  state: z.string().trim().min(2, "Enter your state").max(100),
  country: z.string().trim().min(2, "Enter your country").max(100),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const cartLinesSchema = z
  .array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(99) }))
  .min(1, "Your cart is empty")
  .max(50);
