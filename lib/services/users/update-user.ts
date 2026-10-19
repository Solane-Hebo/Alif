import "server-only";

import mongoose from "mongoose";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";

type UpdateUserData = {
  userId: string;
  name: string;
  role: "ADMIN" | "STAFF";
};

export async function updateUser(
  data: UpdateUserData
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

  if (
    !mongoose.Types.ObjectId.isValid(
      data.userId
    )
  ) {
    return {
      success: false as const,
      reason: "NOT_FOUND" as const,
    };
  }

  await connectToDatabase();

  const user = await User.findOne({
    _id: data.userId,
    organizationId,
  })
    .select("_id role isActive")
    .lean();

  if (!user) {
    return {
      success: false as const,
      reason: "NOT_FOUND" as const,
    };
  }

  /*
   * If an active ADMIN is being downgraded,
   * make sure another active ADMIN exists.
   */
  if (
    user.isActive &&
    user.role === "ADMIN" &&
    data.role !== "ADMIN"
  ) {
    const otherAdminExists =
      await User.exists({
        organizationId,
        _id: { $ne: user._id },
        role: "ADMIN",
        isActive: true,
      });

    if (!otherAdminExists) {
      return {
        success: false as const,
        reason:
          "LAST_ADMIN" as const,
      };
    }
  }

  const roleChanged =
    user.role !== data.role;

  const updatedUser =
    await User.findOneAndUpdate(
      {
        _id: data.userId,
        organizationId,
      },
      {
        $set: {
          name: data.name.trim(),
          role: data.role,
        },

        /*
         * A role change invalidates existing
         * sessions for that user.
         */
        ...(roleChanged
          ? {
              $inc: {
                sessionVersion: 1,
              },
            }
          : {}),
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

  if (!updatedUser) {
    return {
      success: false as const,
      reason: "NOT_FOUND" as const,
    };
  }

  return {
    success: true as const,
  };
}