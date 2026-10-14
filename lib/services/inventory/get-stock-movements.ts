import "server-only";

import { getTenantContext } from "@/lib/auth/tenant";
import { connectToDatabase } from "@/lib/db/mongoose";
import { StockMovement } from "@/lib/models/stock-movement.model";
import { User } from "@/lib/models/user.model";

export async function getStockMovements() {
  const { organizationId } =
    await getTenantContext();

  await connectToDatabase();

  const movements =
    await StockMovement.find({
      organizationId,
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

  const userIds = [
    ...new Set(
      movements.map((movement) =>
        movement.performedBy.toString()
      )
    ),
  ];

  const users = await User.find({
    _id: {
      $in: userIds,
    },
    organizationId,
  })
    .select("_id name")
    .lean();

  const userMap = new Map(
    users.map((user) => [
      user._id.toString(),
      user.name,
    ])
  );

  return movements.map(
    (movement) => ({
      id: movement._id.toString(),

      productName:
        movement.productName,

      productSku:
        movement.productSku,

      type:
        movement.type,

      quantityChange:
        movement.quantityChange,

      stockBefore:
        movement.stockBefore,

      stockAfter:
        movement.stockAfter,

      performedByName:
        userMap.get(
          movement.performedBy.toString()
        ) ?? "Unknown user",

      note:
        movement.note ?? "",

      createdAt:
        movement.createdAt.toISOString(),
    })
  );
}