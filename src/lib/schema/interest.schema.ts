// src/app/lib/schema/interest.schema.ts
import { z } from "zod";

export const createInterestSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  propertyId: z.string().min(1, "Property ID is required"),
  userPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"),
  message: z
    .string()
    .max(500, "Message must be at most 500 characters")
    .optional(),
});

export const updateInterestStatusSchema = z.object({
  status: z.enum(["new", "contacted", "closed"] as const, {
    message: "Status must be new, contacted, or closed",
  }),
});

export type CreateInterestData = z.infer<typeof createInterestSchema>;
export type UpdateInterestStatusData = z.infer<
  typeof updateInterestStatusSchema
>;
