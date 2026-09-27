import "server-only";

import bcrypt from "bcryptjs";

import { hashPasswordResetToken } from "@/lib/auth/password-reset";
import { connectToDatabase } from "@/lib/db/mongoose";
import { PasswordResetToken } from "@/lib/models/password-reset-token.model";
import { User } from "@/lib/models/user.model";

type ResetPasswordInput = {
  token: string;
  password: string;
};

export async function resetPassword({
  token,
  password,
}: ResetPasswordInput) {
  await connectToDatabase();

  const tokenHash = hashPasswordResetToken(token);

  const resetToken = await PasswordResetToken.findOne({
    tokenHash,
    expiresAt: {
      $gt: new Date(),
    },
  });

  if (!resetToken) {
    return {
      success: false as const,
      reason: "INVALID_OR_EXPIRED" as const,
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.findOneAndUpdate(
    {
      _id: resetToken.userId,
      isActive: true,
    },
   {
  $set: {
    passwordHash,
  },
  $inc: {
    sessionVersion: 1,
  },
},
    {
      new: true,
    }
  );

  if (!user) {
    await PasswordResetToken.deleteOne({
      _id: resetToken._id,
    });

    return {
      success: false as const,
      reason: "INVALID_OR_EXPIRED" as const,
    };
  }

  /*
   * Invalidate every outstanding password-reset token
   * belonging to this user.
   */
  await PasswordResetToken.deleteMany({
    userId: user._id,
  });

  return {
    success: true as const,
  };
}