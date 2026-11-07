"use server";

import { redirect } from "next/navigation";

import { registerOrganization } from "@/lib/services/register-organization";
import { registerSchema } from "@/lib/validations/register";

export type RegisterField = 
  | "organizationName"
  | "name"
  | "email"
  | "currency"
  | "locale"
  | "timezone"
  | "calendar"
  | "password"
  | "confirmPassword";

export type RegisterState = {
  error?: string;
  fieldErrors?: Partial<Record<RegisterField, string>>;
};

export async function registerAction(
  _previousState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    organizationName: formData.get("organizationName"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    currency: formData.get("currency"),
    locale: formData.get("locale"),
    timezone: formData.get("timezone"),
    calendar: formData.get("calendar"),
  });

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;

    return {
      fieldErrors: {
        organizationName: errors.organizationName?.[0],
        name: errors.name?.[0],
        email: errors.email?.[0],
        currency: errors.currency?.[0],
        locale: errors.locale?.[0],
        timezone: errors.timezone?.[0],
        calendar: errors.calendar?.[0],
        password: errors.password?.[0],
        confirmPassword: errors.confirmPassword?.[0],
      },
    };
  }

  const result = await registerOrganization({
    organizationName: parsed.data.organizationName,
    name: parsed.data.name,
    email: parsed.data.email,
    password: parsed.data.password,
    currency: parsed.data.currency,
    locale: parsed.data.locale,
    timezone: parsed.data.timezone,
    calendar: parsed.data.calendar,
  });

  if (!result.success) {
    if (result.reason === "EMAIL_EXISTS") {
      return {
        fieldErrors: {
          email: "An account with this email already exists.",
        },
      };
    }

    if (
      result.reason === "INVALID_ORGANIZATION_SETTINGS"
    ) {
      return {
        error:
          "Please check the company currency, regional format, timezone and calendar.",
      };
    }

    return {
      error:
        "Unable to create the company account. Please try again.",
    };
  }

  redirect("/login?registered=1");
}