import {
  InferSchemaType,
  Model,
  Schema,
  model,
  models,
} from "mongoose";

const productSchema = new Schema(
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
      maxlength: 150,
    },

    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 80,
    },

    category: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    /*
     * Money is stored in the smallest currency unit.
     *
     * SEK:
     * 199.90 kr -> 19990 öre
     *
     * Never store prices as floating-point values.
     */
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    lowStockThreshold: {
      type: Number,
      required: true,
      min: 0,
      default: 5,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * A SKU must only be unique inside one organization.
 *
 * Company A may have SKU "ABC-001".
 * Company B may also have SKU "ABC-001".
 */
productSchema.index(
  {
    organizationId: 1,
    sku: 1,
  },
  {
    unique: true,
  }
);

/*
 * Useful for organization-scoped product lists.
 */
productSchema.index({
  organizationId: 1,
  isActive: 1,
  createdAt: -1,
});

export type ProductDocument = InferSchemaType<
  typeof productSchema
>;

export const Product =
  (models.Product as Model<ProductDocument>) ||
  model<ProductDocument>(
    "Product",
    productSchema
  );