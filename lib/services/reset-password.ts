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

  /*
   * Hash the new password before consuming the token.
   * This avoids consuming a valid token if hashing fails.
   */
  const passwordHash = await bcrypt.hash(password, 12);

  const tokenHash = hashPasswordResetToken(token);

  /*
   * Atomically consume the reset token.
   *
   * Only one concurrent request can successfully
   * delete and receive this token.
   */
  const resetToken =
    await PasswordResetToken.findOneAndDelete({
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

  /*
   * Update the password and invalidate existing
   * sessions by incrementing sessionVersion.
   */
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
    return {
      success: false as const,
      reason: "INVALID_OR_EXPIRED" as const,
    };
  }

  /*
   * Invalidate all other reset tokens
   * belonging to this user.
   */
  await PasswordResetToken.deleteMany({
    userId: user._id,
  });

  return {
    success: true as const,
  };
}