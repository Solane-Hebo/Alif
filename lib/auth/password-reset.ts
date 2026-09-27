import "server-only";

import crypto from "node:crypto";

export function generatePasswordResetToken() {
  const token = crypto.randomBytes(32).toString("hex");

  const tokenHash = hashPasswordResetToken(token);

  return {
    token,
    tokenHash,
  };
}

export function hashPasswordResetToken(
  token: string
) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}