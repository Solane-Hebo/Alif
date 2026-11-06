import {
  InferSchemaType,
  Model,
  Schema,
  model,
  models,
} from "mongoose";

const aiAuditLogSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    mode: {
      type: String,
      enum: ["demo", "openai"],
      required: true,
    },

    status: {
      type: String,
      enum: ["SUCCESS", "RATE_LIMITED", "ERROR"],
      required: true,
    },

    responseTimeMs: {
      type: Number,
      required: true,
      min: 0,
    },

    errorCode: {
      type: String,
      default: null,
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

// Support organization-scoped audit queries.
aiAuditLogSchema.index({
  organizationId: 1,
  createdAt: -1,
});

// Automatically delete old audit records.
aiAuditLogSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export type AIAuditLogDocument =
  InferSchemaType<typeof aiAuditLogSchema>;

export const AIAuditLog =
  (models.AIAuditLog as Model<AIAuditLogDocument>) ||
  model<AIAuditLogDocument>(
    "AIAuditLog",
    aiAuditLogSchema
  );