import "server-only";

import mongoose from "mongoose";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/product.model";

export async function archiveProduct(
  productId: string
) {
  const { organizationId, userId } =
    await getTenantContext();

  if (
    !mongoose.Types.ObjectId.isValid(productId)
  ) {
    return {
      success: false as const,
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

  return {
    success: Boolean(product),
  };
}