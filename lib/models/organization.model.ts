import {
  InferSchemaType,
  Model,
  Schema,
  model,
  models,
} from "mongoose";

const organizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },

    currency: {
      type: String,
      required: true,
      default: "SEK",
      uppercase: true,
      trim: true,
    },

    locale: {
      type: String,
      required: true,
      default: "sv-SE",
      trim: true,
    },

    timezone: {
      type: String,
      required: true,
      default: "Europe/Stockholm",
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export type OrganizationDocument = InferSchemaType<
  typeof organizationSchema
>;

export const Organization =
  (models.Organization as Model<OrganizationDocument>) ||
  model<OrganizationDocument>(
    "Organization",
    organizationSchema
  );