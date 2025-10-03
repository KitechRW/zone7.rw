import { z } from "zod";

export const createInterestSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  propertyId: z.string().min(1, "Property ID is required"),
  userPhone: z
    .string()
    .transform((val) => val.replace(/[\s\-()]/g, ""))
    .refine((val) => val.length >= 10, {
      message: "Phone number must be at least 10 digits",
    })
    .refine((val) => val.length <= 15, {
      message: "Phone number must be at most 15 digits",
    })
    .refine(
      (val) => {
        const e164 = /^\+?[1-9]\d{8,14}$/;
        const local = /^0\d{9}$/;
        return e164.test(val) || local.test(val);
      },
      {
        message: "Please enter a valid phone number",
      }
    ),
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
