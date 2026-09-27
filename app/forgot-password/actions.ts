"use server";

import { z } from "zod";

import { requestPasswordReset } from "@/lib/services/request-password-reset";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email(),
});

export type ForgotPasswordState = {
  success?: boolean;
  error?: string;
};

export async function forgotPasswordAction(
  _previousState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      error: "Enter a valid email address.",
    };
  }

  await requestPasswordReset(parsed.data.email);

  return {
    success: true,
  };
}