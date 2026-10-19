import "server-only";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";

export async function getUsers() {
  const {
    organizationId,
    role,
  } = await getTenantContext();

  /*
   * Team administration is ADMIN-only.
   */
  if (role !== "ADMIN") {
    return {
      success: false as const,
      reason: "FORBIDDEN" as const,
      users: [],
    };
  }

  await connectToDatabase();

  const users = await User.find({
    organizationId,
  })
    .select(
      "_id name email role isActive lastLoginAt createdAt"
    )
    .sort({
      createdAt: -1,
    })
    .lean();

  return {
    success: true as const,

    users: users.map((user) => ({
      id: user._id.toString(),

      name: user.name,

      email: user.email,

      role: user.role,

      isActive: user.isActive,

      lastLoginAt:
        user.lastLoginAt?.toISOString() ??
        null,

      createdAt:
        user.createdAt.toISOString(),
    })),
  };
}