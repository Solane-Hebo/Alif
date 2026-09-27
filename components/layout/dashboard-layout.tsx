import type { ReactNode } from "react";

import { requireUser } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Organization } from "@/lib/models/organization.model";

import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

type DashboardLayoutProps = {
  children: ReactNode;
};

export async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await requireUser();

  await connectToDatabase();

  const organization = await Organization.findOne({
    _id: user.organizationId,
    isActive: true,
  })
    .select("name")
    .lean();

  if (!organization) {
    throw new Error(
      "Organization not found or inactive."
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <AppSidebar
          organizationName={organization.name}
        />

        <div className="min-w-0 flex-1">
          <AppHeader />

          <main className="p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}