"use server";

import { z } from "zod";

import { requestPasswordReset } from "@/lib/services/request-password-reset";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email address is required.")
    .email("Enter a valid email address."),
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
      error:
        parsed.error.issues[0]?.message ??
        "Enter a valid email address.",
    };
  }

  try {
    await requestPasswordReset(parsed.data.email);

    return {
      success: true,
    };
  } catch (error) {
    // Keep technical details out of the UI.
    console.error("Password reset request failed:", error);

    return {
      error:
        "We couldn't process your request right now. Please try again later.",
    };
  }
}