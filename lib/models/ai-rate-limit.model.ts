import {
  InferSchemaType,
  Model,
  Schema,
  model,
  models,
} from "mongoose";

const aiRateLimitSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    windowType: {
      type: String,
      enum: ["MINUTE", "DAY"],
      required: true,
    },

    windowStart: {
      type: Date,
      required: true,
    },

    requestCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Keep one counter per user, organization, and time window.
aiRateLimitSchema.index(
  {
    organizationId: 1,
    userId: 1,
    windowType: 1,
    windowStart: 1,
  },
  {
    unique: true,
  }
);

// Automatically remove expired rate-limit records.
aiRateLimitSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  }
);

export type AIRateLimitDocument =
  InferSchemaType<typeof aiRateLimitSchema>;

export const AIRateLimit =
  (models.AIRateLimit as Model<AIRateLimitDocument>) ||
  model<AIRateLimitDocument>(
    "AIRateLimit",
    aiRateLimitSchema
  );