import {
  Schema,
  model,
  models,
} from "mongoose";

const stockMovementSchema = new Schema(
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

    /*
     * Snapshot fields make historical
     * inventory records readable even if
     * the product is later renamed,
     * rescanned or archived.
     */
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

    /*
     * Barcode is optional because older
     * products and manually-created products
     * may not have one.
     */
    productBarcode: {
      type: String,
      trim: true,
      default: "",
    },

    type: {
      type: String,
      enum: [
        "INITIAL",
        "RECEIPT",
        "SALE",
        "SALE_VOID",
        "ADJUSTMENT",
      ],
      required: true,
      index: true,
    },

    /*
     * Signed quantity:
     *
     * +10 = stock increased
     * -2  = stock decreased
     *
     * A movement may never be zero.
     */
    quantityChange: {
      type: Number,
      required: true,
      validate: [
        {
          validator: Number.isInteger,
          message:
            "Quantity change must be a whole number.",
        },
        {
          validator: (value: number) =>
            value !== 0,
          message:
            "Quantity change cannot be zero.",
        },
      ],
    },

    /*
     * Snapshot of inventory immediately
     * before and after this movement.
     */
    stockBefore: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message:
          "Stock before must be a whole number.",
      },
    },

    stockAfter: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message:
          "Stock after must be a whole number.",
      },
    },

    /*
     * Used for movements generated from
     * sales / sale voids.
     *
     * RECEIPT, INITIAL and ADJUSTMENT
     * normally leave this null.
     */
    saleId: {
      type: Schema.Types.ObjectId,
      ref: "Sale",
      default: null,
    },

    /*
     * User who caused the inventory movement.
     */
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
     * Optional explanation.
     *
     * Examples:
     * "Supplier delivery"
     * "Damaged goods"
     * "Inventory count correction"
     */
    note: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

stockMovementSchema.index({
  organizationId: 1,
  createdAt: -1,
});

stockMovementSchema.index({
  organizationId: 1,
  productId: 1,
  createdAt: -1,
});

stockMovementSchema.index({
  organizationId: 1,
  type: 1,
  createdAt: -1,
});

export const StockMovement =
  models.StockMovement ||
  model(
    "StockMovement",
    stockMovementSchema
  );