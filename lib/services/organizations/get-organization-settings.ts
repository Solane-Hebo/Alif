import "server-only";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import {
  Organization,
  type OrganizationCalendar,
} from "@/lib/models/organization.model";

export async function getOrganizationSettings() {
  const { organizationId } =
    await getTenantContext();

  await connectToDatabase();

  const organization =
    await Organization.findOne({
      _id: organizationId,
      isActive: true,
    })
      .select(
        "name currency locale timezone calendar"
      )
      .lean();

  if (!organization) {
    return null;
  }

  return {
    name: organization.name,
    currency: organization.currency,
    locale: organization.locale,
    timezone: organization.timezone,

    calendar:
      (organization.calendar ??
        "gregory") as OrganizationCalendar,
  };
}