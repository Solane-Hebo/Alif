import "server-only";

import mongoose from "mongoose";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/product.model";

export async function archiveProduct(
  productId: string
) {
  const {
    organizationId,
    userId,
    role,
  } = await getTenantContext();

  // Only ADMIN may archive products.
  if (role !== "ADMIN") {
    return {
      success: false as const,
      reason: "FORBIDDEN" as const,
    };
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      productId
    )
  ) {
    return {
      success: false as const,
      reason: "NOT_FOUND" as const,
    };
  }

  await connectToDatabase();

  const product =
    await Product.findOneAndUpdate(
      {
        _id: productId,
        organizationId,
        isActive: true,
      },
      {
        $set: {
          isActive: false,
          updatedBy: userId,
        },
      }
    );

  if (!product) {
    return {
      success: false as const,
      reason: "NOT_FOUND" as const,
    };
  }

  return {
    success: true as const,
  };
}