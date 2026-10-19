import "server-only";

import mongoose from "mongoose";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";

export async function setUserActive(
  userId: string,
  isActive: boolean
) {
  const {
    organizationId,
    userId: currentUserId,
    role,
  } = await getTenantContext();

  if (role !== "ADMIN") {
    return {
      success: false as const,
      reason: "FORBIDDEN" as const,
    };
  }

  if (
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return {
      success: false as const,
      reason: "NOT_FOUND" as const,
    };
  }

  await connectToDatabase();

  const user = await User.findOne({
    _id: userId,
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

  if (user.isActive === isActive) {
    return {
      success: true as const,
    };
  }

  /*
   * Do not allow the currently logged-in
   * ADMIN to deactivate their own account.
   */
  if (
    !isActive &&
    user._id.toString() === currentUserId
  ) {
    return {
      success: false as const,
      reason:
        "CANNOT_DEACTIVATE_SELF" as const,
    };
  }

  /*
   * Never remove the organization's last
   * active ADMIN.
   */
  if (
    !isActive &&
    user.role === "ADMIN"
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

  const updatedUser =
    await User.findOneAndUpdate(
      {
        _id: userId,
        organizationId,
        isActive: user.isActive,
      },
      {
        $set: {
          isActive,
        },

        /*
         * Revoke all existing JWT sessions
         * whenever account access changes.
         */
        $inc: {
          sessionVersion: 1,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

  if (!updatedUser) {
    return {
      success: false as const,
      reason:
        "USER_CHANGED" as const,
    };
  }

  return {
    success: true as const,
  };
}