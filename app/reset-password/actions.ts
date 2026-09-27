"use server";

import { redirect } from "next/navigation";

import { signOut } from "@/auth";
import { resetPassword } from "@/lib/services/reset-password";
import { resetPasswordSchema } from "@/lib/validations/reset-password";

export type ResetPasswordState = {
  error?: string;
};

export async function resetPasswordAction(
  _previousState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Please check the information you entered.",
    };
  }

  const result = await resetPassword({
    token: parsed.data.token,
    password: parsed.data.password,
  });

  if (!result.success) {
    return {
      error:
        "This password reset link is invalid or has expired.",
    };
  }

  await signOut({
    redirectTo: "/login?reset=1",
  });

  redirect("/login?reset=1");
}