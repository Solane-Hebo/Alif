import "server-only";

import { requireUser } from "@/lib/auth/guards";

export type TenantContext = {
  userId: string;
  organizationId: string;
  role: "ADMIN" | "STAFF";
};

export async function getTenantContext(): Promise<TenantContext> {
  const user = await requireUser();

  return {
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role,
  };
}