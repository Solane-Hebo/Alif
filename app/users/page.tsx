import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AddUserDialog } from "@/components/users/add-user-dialog";
import { UserActions } from "@/components/users/user-actions";

import { getTenantContext } from "@/lib/auth/tenant";
import { getOrganizationSettings } from "@/lib/services/organizations/get-organization-settings";
import { getUsers } from "@/lib/services/users/get-users";
import { formatDateTime } from "@/lib/utils/date-format";

export default async function UsersPage() {
  const { role } =
    await getTenantContext();

  if (role !== "ADMIN") {
    redirect("/");
  }

  const [result, organization] =
    await Promise.all([
      getUsers(),
      getOrganizationSettings(),
    ]);

  if (!result.success) {
    redirect("/");
  }

  if (!organization) {
    redirect("/");
  }

  return (
    <DashboardLayout>
      <main className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Users
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your organization&apos;s
              team members and access.
            </p>
          </div>

          <AddUserDialog />
        </div>

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Name
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Email
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Role
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Last login
                  </th>

                  <th className="px-4 py-3 text-right font-medium text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {result.users.map(
                  (user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {user.name}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {user.email}
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {user.role}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={
                            user.isActive
                              ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                              : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                          }
                        >
                          {user.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                        {user.lastLoginAt
                          ? formatDateTime(
                              user.lastLoginAt,
                              {
                                locale:
                                  organization.locale,
                                timezone:
                                  organization.timezone,
                                calendar:
                                  organization.calendar,
                              }
                            )
                          : "Never"}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <UserActions
                          user={{
                            id: user.id,
                            name: user.name,
                            role: user.role,
                            isActive:
                              user.isActive,
                          }}
                        />
                      </td>
                    </tr>
                  )
                )}

                {result.users.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}