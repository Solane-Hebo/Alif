import dotenv from "dotenv";


import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { Organization } from "../lib/models/organization.model";
import { User } from "../lib/models/user.model";
dotenv.config({ path: ".env.local" });

async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  const organizationName = process.env.SEED_ORGANIZATION_NAME;
  const organizationSlug = process.env.SEED_ORGANIZATION_SLUG;
  const adminName = process.env.SEED_ADMIN_NAME;
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (
    !mongoUri ||
    !organizationName ||
    !organizationSlug ||
    !adminName ||
    !adminEmail ||
    !adminPassword
  ) {
    throw new Error("Missing required seed environment variables.");
  }

  if (adminPassword.length < 12) {
    throw new Error(
      "SEED_ADMIN_PASSWORD must contain at least 12 characters."
    );
  }

  await mongoose.connect(mongoUri);

  const normalizedEmail = adminEmail.trim().toLowerCase();
  const normalizedSlug = organizationSlug.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  }).lean();

  if (existingUser) {
    throw new Error(
      "A user with this email already exists. Seed stopped."
    );
  }

  let organization = await Organization.findOne({
    slug: normalizedSlug,
  });

  if (!organization) {
    organization = await Organization.create({
      name: organizationName.trim(),
      slug: normalizedSlug,
      currency: "SEK",
      locale: "sv-SE",
      timezone: "Europe/Stockholm",
      isActive: true,
    });

    console.log("Organization created.");
  } else {
    console.log("Organization already exists.");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await User.create({
    organizationId: organization._id,
    name: adminName.trim(),
    email: normalizedEmail,
    passwordHash,
    role: "ADMIN",
    isActive: true,
  });

  console.log("Admin user created.");
  console.log("Seed completed successfully.");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });