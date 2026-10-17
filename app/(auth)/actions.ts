"use server";

import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type AuthActionState = {
  success: boolean;
  errors: Record<string, string[]> | null;
  data: any | null;
  message?: string;
};

export async function validateLoginAction(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const data = Object.fromEntries(formData.entries());

  const validatedFields = loginSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      data: data,
      message: "Please fix the errors below.",
    };
  }

  return {
    success: true,
    errors: null,
    data: validatedFields.data,
  };
}
