import "server-only";

import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { AIAuditLog } from "@/lib/models/ai-audit-log.model";

type AIAuditMode = "demo" | "openai";

type AIAuditStatus = "SUCCESS" | "RATE_LIMITED" | "ERROR";

type CreateAIAuditLogInput = {
  organizationId: string;
  userId: string;
  mode: AIAuditMode;
  status: AIAuditStatus;
  responseTimeMs: number;
  errorCode?: string;
};

const AUDIT_RETENTION_DAYS = 30;

export async function createAIAuditLog(
  input: CreateAIAuditLogInput
): Promise<void> {
  const expiresAt = new Date(
    Date.now() + AUDIT_RETENTION_DAYS * 24 * 60 * 60 * 1000
  );

  await connectToDatabase();

  await AIAuditLog.create({
    organizationId: new mongoose.Types.ObjectId(
      input.organizationId
    ),

    userId: new mongoose.Types.ObjectId(input.userId),

    mode: input.mode,

    status: input.status,

    responseTimeMs: Math.max(
      0,
      Math.round(input.responseTimeMs)
    ),

    errorCode: input.errorCode ?? null,

    expiresAt,
  });
}