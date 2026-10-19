import mongoose, {
  Schema,
  model,
  models,
} from "mongoose";

const saleSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    // Snapshot so historical sales keep the
    // product information from the sale date.
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    productSku: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // Money is stored in minor units:
    // 10000 = 100.00 SEK
    purchasePriceAtSale: {
      type: Number,
      required: true,
      min: 0,
    },

    salePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["COMPLETED", "VOIDED"],
      default: "COMPLETED",
      required: true,
      index: true,
    },

    soldBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    voidedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    voidedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

saleSchema.index({
  organizationId: 1,
  createdAt: -1,
});

saleSchema.index({
  organizationId: 1,
  productId: 1,
  createdAt: -1,
});

export const Sale =
  models.Sale || model("Sale", saleSchema);