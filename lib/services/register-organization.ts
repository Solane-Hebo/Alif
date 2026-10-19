import "server-only";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import {
  Organization,
  type OrganizationCalendar,
} from "@/lib/models/organization.model";
import { User } from "@/lib/models/user.model";

type RegisterOrganizationInput = {
  organizationName: string;
  name: string;
  email: string;
  password: string;
  currency: string;
  locale: string;
  timezone: string;
  calendar: OrganizationCalendar;
};

function createSlug(name: string) {
  const base =
    name
      .trim()
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "company";

  const suffix = new mongoose.Types.ObjectId()
    .toString()
    .slice(-6);

  return `${base}-${suffix}`;
}

function isValidCurrency(
  currency: string
) {
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

function isValidOrganizationFormatting({
  locale,
  timezone,
  calendar,
}: {
  locale: string;
  timezone: string;
  calendar: OrganizationCalendar;
}) {
  try {
    const resolvedLocale =
      new Intl.Locale(locale, {
        calendar,
      }).toString();

    new Intl.DateTimeFormat(
      resolvedLocale,
      {
        timeZone: timezone,
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(new Date());

    return true;
  } catch {
    return false;
  }
}

export async function registerOrganization(
  input: RegisterOrganizationInput
) {
  await connectToDatabase();

  const normalizedEmail = input.email
    .trim()
    .toLowerCase();

  const currency = input.currency
    .trim()
    .toUpperCase();

  const locale = input.locale.trim();

  const timezone = input.timezone.trim();

  const calendar = input.calendar;

  if (
    !isValidCurrency(currency) ||
    !isValidOrganizationFormatting({
      locale,
      timezone,
      calendar,
    })
  ) {
    return {
      success: false as const,
      reason:
        "INVALID_ORGANIZATION_SETTINGS" as const,
    };
  }

  const existingUser = await User.exists({
    email: normalizedEmail,
  });

  if (existingUser) {
    return {
      success: false as const,
      reason: "EMAIL_EXISTS" as const,
    };
  }

  const passwordHash = await bcrypt.hash(
    input.password,
    12
  );

  const session =
    await mongoose.startSession();

  try {
    let createdOrganizationId = "";

    await session.withTransaction(
      async () => {
        /*
         * Check again inside the transaction.
         * The unique email index remains the
         * final database-level protection.
         */
        const duplicateUser =
          await User.exists({
            email: normalizedEmail,
          }).session(session);

        if (duplicateUser) {
          throw new Error(
            "EMAIL_EXISTS"
          );
        }

        const organizations =
          await Organization.create(
            [
              {
                name: input.organizationName.trim(),
                slug: createSlug(
                  input.organizationName
                ),
                currency,
                locale,
                timezone,
                calendar,
                isActive: true,
              },
            ],
            { session }
          );

        const organization =
          organizations[0];

        await User.create(
          [
            {
              organizationId:
                organization._id,
              name: input.name.trim(),
              email: normalizedEmail,
              passwordHash,
              role: "ADMIN",
              isActive: true,
            },
          ],
          { session }
        );

        createdOrganizationId =
          organization._id.toString();
      }
    );

    return {
      success: true as const,
      organizationId:
        createdOrganizationId,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "EMAIL_EXISTS"
    ) {
      return {
        success: false as const,
        reason:
          "EMAIL_EXISTS" as const,
      };
    }

    throw error;
  } finally {
    await session.endSession();
  }
}