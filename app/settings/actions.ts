"use server";

import { revalidatePath } from "next/cache";

import {
  updateOrganizationSettings,
} from "@/lib/services/organizations/update-organization-settings";

export type SettingsActionState = {
  success: boolean;
  message: string;
};

export async function updateSettingsAction(
  _previousState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const result =
    await updateOrganizationSettings({
      name: String(
        formData.get("name") ?? ""
      ),

      currency: String(
        formData.get("currency") ?? ""
      ),

      locale: String(
        formData.get("locale") ?? ""
      ),

      timezone: String(
        formData.get("timezone") ?? ""
      ),

      calendar: String(
        formData.get("calendar") ?? ""
      ),
    });

  if (!result.success) {
    return {
      success: false,
      message: result.error,
    };
  }

  revalidatePath("/");
  revalidatePath("/reports");
  revalidatePath("/products");
  revalidatePath("/sales");
  revalidatePath("/inventory");
  revalidatePath("/users");
  revalidatePath("/settings");

  return {
    success: true,
    message:
      "Organization settings updated.",
  };
}