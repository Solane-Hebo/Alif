import {
  InferSchemaType,
  Model,
  Schema,
  model,
  models,
} from "mongoose";

const passwordResetTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * MongoDB can automatically remove expired reset tokens.
 * The deletion is asynchronous, so application code must still
 * explicitly check expiresAt before accepting a token.
 */
passwordResetTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export type PasswordResetTokenDocument =
  InferSchemaType<typeof passwordResetTokenSchema>;

export const PasswordResetToken =
  (models.PasswordResetToken as Model<PasswordResetTokenDocument>) ||
  model<PasswordResetTokenDocument>(
    "PasswordResetToken",
    passwordResetTokenSchema
  );