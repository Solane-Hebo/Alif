"use server";

import { redirect } from "next/navigation";

import { registerOrganization } from "@/lib/services/register-organization";
import { registerSchema } from "@/lib/validations/register";

export type RegisterState = {
  error?: string;
};

export async function registerAction(
  _previousState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    organizationName: formData.get(
      "organizationName"
    ),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get(
      "confirmPassword"
    ),
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Please check the information you entered.",
    };
  }

  const result = await registerOrganization({
    organizationName:
      parsed.data.organizationName,
    name: parsed.data.name,
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (!result.success) {
    return {
      error:
        "An account with this email already exists.",
    };
  }

  redirect("/login?registered=1");
}