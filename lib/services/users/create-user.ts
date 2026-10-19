import "server-only";

import bcrypt from "bcryptjs";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";

type CreateUserData = {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "STAFF";
};

export async function createUser(
  data: CreateUserData
) {
  const {
    organizationId,
    role: currentUserRole,
  } = await getTenantContext();

  if (currentUserRole !== "ADMIN") {
    return {
      success: false as const,
      reason: "FORBIDDEN" as const,
    };
  }

  await connectToDatabase();

  const email = data.email
    .trim()
    .toLowerCase();

  /*
   * Email is currently globally unique
   * because authentication uses email
   * without organization selection.
   */
  const existingUser = await User.exists({
    email,
  });

  if (existingUser) {
    return {
      success: false as const,
      reason: "EMAIL_EXISTS" as const,
    };
  }

  const passwordHash = await bcrypt.hash(
    data.password,
    12
  );

  try {
    const user = await User.create({
      /*
       * organizationId always comes from
       * the authenticated ADMIN session.
       */
      organizationId,

      name: data.name.trim(),
      email,
      passwordHash,

      role: data.role,

      isActive: true,
    });

    return {
      success: true as const,
      userId: user._id.toString(),
    };
  } catch (error) {
    /*
     * MongoDB unique index remains the
     * final protection against two admins
     * creating the same email concurrently.
     */
    if (
      error instanceof Error &&
      "code" in error &&
      (
        error as Error & {
          code?: number;
        }
      ).code === 11000
    ) {
      return {
        success: false as const,
        reason: "EMAIL_EXISTS" as const,
      };
    }

    throw error;
  }
}