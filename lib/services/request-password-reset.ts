import "server-only";

import { generatePasswordResetToken } from "@/lib/auth/password-reset";
import { connectToDatabase } from "@/lib/db/mongoose";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset-email";
import { PasswordResetToken } from "@/lib/models/password-reset-token.model";
import { User } from "@/lib/models/user.model";

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

  /*
   * Never reveal whether the account exists.
   */
  if (!user) {
    return;
  }

  const appUrl =
    process.env.APP_URL ??
    "http://localhost:3000";

  /*
   * Invalidate previous reset requests.
   */
  await PasswordResetToken.deleteMany({
    userId: user._id,
  });

  const { token, tokenHash } =
    generatePasswordResetToken();

  const expiresAt = new Date(
    Date.now() + 30 * 60 * 1000
  );

  const resetToken =
    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

  const resetUrl =
    `${appUrl}/reset-password?token=` +
    encodeURIComponent(token);

  try {
    await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
    });
  } catch (error) {
    /*
     * Do not leave a usable reset token behind
     * if email delivery failed.
     */
    await PasswordResetToken.deleteOne({
      _id: resetToken._id,
    });

    throw error;
  }
}