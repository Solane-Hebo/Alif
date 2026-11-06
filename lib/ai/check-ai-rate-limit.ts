import "server-only";

import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { AIRateLimit } from "@/lib/models/ai-rate-limit.model";

type RateLimitUser = {
  id: string;
  organizationId: string;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

const MINUTE_LIMIT = 10;
const DAY_LIMIT = 100;

export async function checkAIRateLimit(
  user: RateLimitUser
): Promise<RateLimitResult> {
  await connectToDatabase();

  const now = new Date();

  const minuteStart = new Date(now);
  minuteStart.setUTCSeconds(0, 0);

  const dayStart = new Date(now);
  dayStart.setUTCHours(0, 0, 0, 0);

  const minuteEnd = new Date(
    minuteStart.getTime() + 60_000
  );

  const dayEnd = new Date(
    dayStart.getTime() + 86_400_000
  );

  const organizationId = new mongoose.Types.ObjectId(
    user.organizationId
  );

  const userId = new mongoose.Types.ObjectId(user.id);

  const windows = [
    {
      windowType: "MINUTE",
      windowStart: minuteStart,
      expiresAt: minuteEnd,
      limit: MINUTE_LIMIT,
    },
    {
      windowType: "DAY",
      windowStart: dayStart,
      expiresAt: dayEnd,
      limit: DAY_LIMIT,
    },
  ] as const;

  for (const window of windows) {
    const filter = {
      organizationId,
      userId,
      windowType: window.windowType,
      windowStart: window.windowStart,
    };

    // Create the counter if it does not exist.
    // The unique index prevents duplicate counters.
    try {
      await AIRateLimit.updateOne(
        filter,
        {
          $setOnInsert: {
            ...filter,
            requestCount: 0,
            expiresAt: window.expiresAt,
          },
        },
        { upsert: true }
      );
    } catch (error) {
      // A concurrent request may have created the counter.
      if (
        !(error instanceof mongoose.mongo.MongoServerError) ||
        error.code !== 11000
      ) {
        throw error;
      }
    }

    // Atomically increment only when below the limit.
    const updated = await AIRateLimit.findOneAndUpdate(
      {
        ...filter,
        requestCount: { $lt: window.limit },
      },
      {
        $inc: { requestCount: 1 },
      },
      {
        new: true,
      }
    );

    if (!updated) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil(
            (window.expiresAt.getTime() - Date.now()) /
              1000
          )
        ),
      };
    }
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}