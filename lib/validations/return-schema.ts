import { z } from "zod";

// Base schemas
const ReturnItemSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    detail: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
    selected: z.boolean(),
    returnQuantity: z.number().int().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.selected || data.quantity <= 1) return;
    const rq = data.returnQuantity;
    if (rq == null || rq < 1 || rq > data.quantity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select how many units you are returning.",
        path: ["returnQuantity"],
      });
    }
  });

/** Bolt/Yango-style: single address line, optional landmark, optional map pin */
const pickupAddressSchema = z.object({
  address: z.string().max(500),
  landmark: z.string().max(255).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

const parcelSchema = z.object({
  description: z.string().max(1000),
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
        if (!data.pickupAddress.address.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Enter a pickup address or use the map.",
            path: ["pickupAddress", "address"],
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
      address: "",
      landmark: "",
      latitude: undefined,
      longitude: undefined,
    },
    parcel: {
      description: "",
    },
  },
};
