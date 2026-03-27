import { z } from "zod";

// Base schemas
const ReturnItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  detail: z.string(),
  quantity: z.number().min(1),
  price: z.number().min(0),
  selected: z.boolean(),
});

const pickupAddressSchema = z.object({
  line1: z.string().max(255),
  line2: z.string().max(255).optional(),
  city: z.string().max(120),
  region: z.string().max(120),
  postalCode: z.string().max(32).optional(),
});

const parcelSchema = z.object({
  packageCount: z.number().int().min(1).max(99),
  description: z.string().max(1000),
  weightKg: z.number().positive().max(999).optional(),
});

export const ReturnFlowSchema = z.object({
  // Step 1: Items
  items: z.array(ReturnItemSchema).refine((items) => items.some((item) => item.selected), {
    message: "You must select at least one item to return.",
  }),

  // Step 2: Reason
  reason: z.enum(["DEFECTIVE", "WRONG_ITEM", "CHANGED_MIND", "DAMAGED_IN_DELIVERY", "OTHER"], {
    message: "Please select a reason for your return.",
  }),
  description: z.string().max(500, "Description must be less than 500 characters.").optional(),

  // Step 3: Photos
  photos: z.array(z.string()).max(5, "You can upload a maximum of 5 photos.").optional(),

  // Step 4: Eligibility
  isEligible: z.boolean().nullable(),

  // Step 5: Logistics
  logistics: z
    .object({
      method: z.enum(["HOME_PICKUP", "DROP_OFF"]),
      pudoPointId: z.string().optional(),
      timeSlot: z.string().min(1, "Please select a time slot."),
      phoneCountry: z.string().min(2),
      phoneNumber: z.string().min(8, "Phone number must be at least 8 characters."),
      pickupAddress: pickupAddressSchema,
      parcel: parcelSchema,
    })
    .superRefine((data, ctx) => {
      if (data.method === "DROP_OFF" && !data.pudoPointId?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a drop-off point.",
          path: ["pudoPointId"],
        });
      }
      if (data.method === "HOME_PICKUP") {
        if (!data.pickupAddress.line1.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Street address is required.",
            path: ["pickupAddress", "line1"],
          });
        }
        if (!data.pickupAddress.city.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "City is required.",
            path: ["pickupAddress", "city"],
          });
        }
        if (!data.pickupAddress.region.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Region is required.",
            path: ["pickupAddress", "region"],
          });
        }
        if (!data.parcel.description.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Describe what you are returning (helps the courier).",
            path: ["parcel", "description"],
          });
        }
      }
    }),
});

export type ReturnFlowFormData = z.infer<typeof ReturnFlowSchema>;

export const defaultReturnFlowValues: Partial<ReturnFlowFormData> = {
  items: [],
  reason: undefined,
  description: "",
  photos: [],
  isEligible: null,
  logistics: {
    method: "HOME_PICKUP",
    pudoPointId: "",
    timeSlot: "",
    phoneCountry: "GH",
    phoneNumber: "",
    pickupAddress: {
      line1: "",
      line2: "",
      city: "",
      region: "",
      postalCode: "",
    },
    parcel: {
      packageCount: 1,
      description: "",
      weightKg: undefined,
    },
  },
};
