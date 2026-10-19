import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { OrganizationSettingsForm } from "@/components/settings/organization-settings-form";

import { getTenantContext } from "@/lib/auth/tenant";
import { getOrganizationSettings } from "@/lib/services/organizations/get-organization-settings";

export default async function SettingsPage() {
  const user =
    await getTenantContext();

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  const organization =
    await getOrganizationSettings();

  if (!organization) {
    redirect("/");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Settings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your organization
            and regional preferences.
          </p>
        </div>

        <OrganizationSettingsForm
          organization={organization}
        />
      </div>
    </DashboardLayout>
  );
}