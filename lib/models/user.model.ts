import {
  InferSchemaType,
  Model,
  Schema,
  model,
  models,
} from "mongoose";

export const USER_ROLES = ["ADMIN", "STAFF"] as const;

const userSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
      default: "STAFF",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
    sessionVersion: {
  type: Number,
  required: true,
  default: 0,
},
  },
  {
    timestamps: true,
  }
);


export type UserDocument = InferSchemaType<typeof userSchema>;

export const User =
  (models.User as Model<UserDocument>) ||
  model<UserDocument>("User", userSchema);