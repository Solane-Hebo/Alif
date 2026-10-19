import dotenv from "dotenv";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { Organization } from "../lib/models/organization.model";
import { User } from "../lib/models/user.model";

dotenv.config({ path: ".env.local" });

function isValidCurrency(currency: string) {
  try {
    new Intl.NumberFormat("en", {
      style: "currency",
      currency,
    });

    return true;
  } catch {
    return false;
  }
}

function isValidLocale(locale: string) {
  try {
    new Intl.NumberFormat(locale);
    return true;
  } catch {
    return false;
  }
}

function isValidTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("en", {
      timeZone: timezone,
    });

    return true;
  } catch {
    return false;
  }
}

async function seed() {
  const mongoUri =
    process.env.MONGODB_URI;

  const organizationName =
    process.env.SEED_ORGANIZATION_NAME;

  const organizationSlug =
    process.env.SEED_ORGANIZATION_SLUG;

  const currency =
    process.env.SEED_ORGANIZATION_CURRENCY;

  const locale =
    process.env.SEED_ORGANIZATION_LOCALE;

  const timezone =
    process.env.SEED_ORGANIZATION_TIMEZONE;

  const adminName =
    process.env.SEED_ADMIN_NAME;

  const adminEmail =
    process.env.SEED_ADMIN_EMAIL;

  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD;

  if (
    !mongoUri ||
    !organizationName ||
    !organizationSlug ||
    !currency ||
    !locale ||
    !timezone ||
    !adminName ||
    !adminEmail ||
    !adminPassword
  ) {
    throw new Error(
      "Missing required seed environment variables."
    );
  }

  const normalizedCurrency = currency
    .trim()
    .toUpperCase();

  const normalizedLocale =
    locale.trim();

  const normalizedTimezone =
    timezone.trim();

  if (
    !isValidCurrency(
      normalizedCurrency
    )
  ) {
    throw new Error(
      "SEED_ORGANIZATION_CURRENCY is invalid."
    );
  }

  if (
    !isValidLocale(
      normalizedLocale
    )
  ) {
    throw new Error(
      "SEED_ORGANIZATION_LOCALE is invalid."
    );
  }

  if (
    !isValidTimezone(
      normalizedTimezone
    )
  ) {
    throw new Error(
      "SEED_ORGANIZATION_TIMEZONE is invalid."
    );
  }

  if (adminPassword.length < 12) {
    throw new Error(
      "SEED_ADMIN_PASSWORD must contain at least 12 characters."
    );
  }

  await mongoose.connect(mongoUri);

  const normalizedEmail =
    adminEmail
      .trim()
      .toLowerCase();

  const normalizedSlug =
    organizationSlug
      .trim()
      .toLowerCase();

  const existingUser =
    await User.findOne({
      email: normalizedEmail,
    }).lean();

  if (existingUser) {
    throw new Error(
      "A user with this email already exists. Seed stopped."
    );
  }

  let organization =
    await Organization.findOne({
      slug: normalizedSlug,
    });

  if (!organization) {
    organization =
      await Organization.create({
        name: organizationName.trim(),
        slug: normalizedSlug,

        currency:
          normalizedCurrency,

        locale:
          normalizedLocale,

        timezone:
          normalizedTimezone,

        isActive: true,
      });

    console.log(
      "Organization created."
    );
  } else {
    console.log(
      "Organization already exists."
    );
  }

  const passwordHash =
    await bcrypt.hash(
      adminPassword,
      12
    );

  await User.create({
    organizationId:
      organization._id,

    name: adminName.trim(),

    email: normalizedEmail,

    passwordHash,

    role: "ADMIN",

    isActive: true,
  });

  console.log(
    "Admin user created."
  );

  console.log(
    "Seed completed successfully."
  );
}

seed()
  .catch((error) => {
    console.error(
      "Seed failed:",
      error
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });