import { z } from "zod";

export const postShiftSchema = z.object({
  date: z.string().min(1, "Date is required"),
  end_time: z.string().min(1, "End time is required"),
  hourly_rate: z.number().positive("Hourly rate must be positive").optional(),
  location_id: z.string().min(1, "Location is required"),
  notes: z.string().max(500, "Notes must be under 500 characters").optional(),
  role: z.string().min(1, "Role is required"),
  start_time: z.string().min(1, "Start time is required"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be under 100 characters"),
});

export const createBusinessSchema = z.object({
  name: z
    .string()
    .min(1, "Business name is required")
    .max(100, "Business name must be under 100 characters"),
});

export const createLocationSchema = z.object({
  address: z
    .string()
    .min(1, "Address is required")
    .max(200, "Address must be under 200 characters"),
  business_id: z.string().min(1, "Business is required"),
  name: z
    .string()
    .min(1, "Location name is required")
    .max(100, "Location name must be under 100 characters"),
});

export const claimShiftSchema = z.object({
  shift_id: z.string().min(1, "Shift ID is required"),
});

export const approveClaimSchema = z.object({
  claim_id: z.string().min(1, "Claim ID is required"),
});

export const rejectClaimSchema = z.object({
  claim_id: z.string().min(1, "Claim ID is required"),
  reason: z.string().max(500, "Reason must be under 500 characters").optional(),
});

export const updateProfileSchema = z.object({
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be under 100 characters"),
});

export const shiftFilterSchema = z.object({
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  location_id: z.string().optional(),
  role: z.string().optional(),
  status: z
    .enum(["open", "claimed", "approved", "cancelled", "completed"])
    .optional(),
});

export type PostShiftInput = z.infer<typeof postShiftSchema>;

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;

export type CreateLocationInput = z.infer<typeof createLocationSchema>;

export type ClaimShiftInput = z.infer<typeof claimShiftSchema>;

export type ApproveClaimInput = z.infer<typeof approveClaimSchema>;

export type RejectClaimInput = z.infer<typeof rejectClaimSchema>;

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type ShiftFilterInput = z.infer<typeof shiftFilterSchema>;
