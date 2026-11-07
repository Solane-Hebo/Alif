import "server-only";

import { generatePasswordResetToken } from "@/lib/auth/password-reset";
import { connectToDatabase } from "@/lib/db/mongoose";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset-email";
import { PasswordResetToken } from "@/lib/models/password-reset-token.model";
import { User } from "@/lib/models/user.model";

const RESET_TOKEN_LIFETIME_MS = 30 * 60 * 1000;
const RESET_REQUEST_COOLDOWN_MS = 60 * 1000;

export async function requestPasswordReset(
  email: string
) {
  await connectToDatabase();

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
    isActive: true,
  })
    .select("_id email")
    .lean();

  // Do not reveal whether the account exists.
  if (!user) {
    return;
  }

  /*
   * Check whether a reset token was recently created.
   * This provides a basic per-account cooldown.
   */
  const latestToken = await PasswordResetToken.findOne({
    userId: user._id,
  })
    .sort({ createdAt: -1 })
    .select("createdAt")
    .lean();

  if (latestToken?.createdAt) {
    const elapsed =
      Date.now() -
      new Date(latestToken.createdAt).getTime();

    if (elapsed < RESET_REQUEST_COOLDOWN_MS) {
      return;
    }
  }

  /*
   * Require an explicitly configured production URL.
   * Do not silently fall back to localhost in production.
   */
  const appUrl = process.env.APP_URL?.trim();

  if (!appUrl) {
    throw new Error("APP_URL is not configured.");
  }

  const parsedAppUrl = new URL(appUrl);

  if (
    process.env.NODE_ENV === "production" &&
    parsedAppUrl.protocol !== "https:"
  ) {
    throw new Error(
      "APP_URL must use HTTPS in production."
    );
  }

  /*
   * Invalidate previous reset requests.
   */
  await PasswordResetToken.deleteMany({
    userId: user._id,
  });

  const { token, tokenHash } =
    generatePasswordResetToken();

  const expiresAt = new Date(
    Date.now() + RESET_TOKEN_LIFETIME_MS
  );

  const resetToken =
    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

  const resetUrl = new URL(
    "/reset-password",
    parsedAppUrl
  );

  resetUrl.searchParams.set("token", token);

  try {
    await sendPasswordResetEmail({
      to: user.email,
      resetUrl: resetUrl.toString(),
    });
  } catch (error) {
    /*
     * Remove the new token if delivery fails.
     */
    await PasswordResetToken.deleteOne({
      _id: resetToken._id,
    });

    throw error;
  }
}