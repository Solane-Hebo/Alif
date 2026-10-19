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
    currency: formData.get("currency"),
    locale: formData.get("locale"),
    timezone: formData.get("timezone"),
    calendar: formData.get("calendar"),
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Please check the information you entered.",
    };
  }

  const result =
    await registerOrganization({
      organizationName:
        parsed.data.organizationName,
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      currency: parsed.data.currency,
      locale: parsed.data.locale,
      timezone: parsed.data.timezone,
      calendar: parsed.data.calendar,
    });

  if (!result.success) {
    if (
      result.reason ===
      "EMAIL_EXISTS"
    ) {
      return {
        error:
          "An account with this email already exists.",
      };
    }

    if (
      result.reason ===
      "INVALID_ORGANIZATION_SETTINGS"
    ) {
      return {
        error:
          "Please check the company currency, regional format, timezone and calendar.",
      };
    }

    return {
      error:
        "Unable to create the company account.",
    };
  }

  redirect("/login?registered=1");
}