import "server-only";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Organization } from "@/lib/models/organization.model";
import {
  updateOrganizationSettingsSchema,
} from "@/lib/validations/organization";

type UpdateOrganizationSettingsInput = {
  name: string;
  currency: string;
  locale: string;
  timezone: string;
  calendar: string;
};

export async function updateOrganizationSettings(
  input: UpdateOrganizationSettingsInput
) {
  const {
    organizationId,
    role,
  } = await getTenantContext();

  if (role !== "ADMIN") {
    return {
      success: false as const,
      error:
        "You are not allowed to update organization settings.",
    };
  }

  const parsed =
    updateOrganizationSettingsSchema.safeParse(
      input
    );

  if (!parsed.success) {
    return {
      success: false as const,
      error:
        parsed.error.issues[0]?.message ??
        "Invalid settings.",
    };
  }

  /*
   * Validate that Intl recognizes the
   * locale, currency, timezone and calendar.
   */
  try {
    new Intl.NumberFormat(
      parsed.data.locale,
      {
        style: "currency",
        currency:
          parsed.data.currency,
      }
    ).format(100);

    new Intl.DateTimeFormat(
      `${parsed.data.locale}-u-ca-${parsed.data.calendar}`,
      {
        timeZone:
          parsed.data.timezone,
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(new Date());
  } catch {
    return {
      success: false as const,
      error:
        "Invalid currency, locale, timezone or calendar.",
    };
  }

  await connectToDatabase();

  const organization =
    await Organization.findOneAndUpdate(
      {
        _id: organizationId,
        isActive: true,
      },
      {
        $set: {
          name: parsed.data.name,
          currency:
            parsed.data.currency,
          locale:
            parsed.data.locale,
          timezone:
            parsed.data.timezone,
          calendar:
            parsed.data.calendar,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    )
      .select(
        "name currency locale timezone calendar"
      )
      .lean();

  if (!organization) {
    return {
      success: false as const,
      error:
        "Organization not found.",
    };
  }

  return {
    success: true as const,
  };
}