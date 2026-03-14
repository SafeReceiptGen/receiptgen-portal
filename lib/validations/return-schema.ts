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
  logistics: z.object({
    method: z.enum(["HOME_PICKUP", "DROP_OFF"]),
    pudoPointId: z.string().optional(),
    timeSlot: z.string().min(1, "Please select a time slot."),
    phoneCountry: z.string().min(2),
    phoneNumber: z.string().min(8, "Phone number must be at least 8 characters."),
  }).refine((data) => !(data.method === "DROP_OFF" && !data.pudoPointId), {
    message: "Please select a drop-off point.",
    path: ["pudoPointId"],
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
  },
};
