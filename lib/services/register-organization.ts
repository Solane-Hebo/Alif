import "server-only";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { Organization } from "@/lib/models/organization.model";
import { User } from "@/lib/models/user.model";

type RegisterOrganizationInput = {
  organizationName: string;
  name: string;
  email: string;
  password: string;
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

export async function registerOrganization(
  input: RegisterOrganizationInput
) {
  await connectToDatabase();

  const normalizedEmail = input.email
    .trim()
    .toLowerCase();

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

  const session = await mongoose.startSession();

  try {
    let createdOrganizationId = "";

    await session.withTransaction(async () => {
      // Check again inside the transaction.
      const duplicateUser = await User.exists({
        email: normalizedEmail,
      }).session(session);

      if (duplicateUser) {
        throw new Error("EMAIL_EXISTS");
      }

      const organizations = await Organization.create(
        [
          {
            name: input.organizationName.trim(),
            slug: createSlug(input.organizationName),
            currency: "SEK",
            locale: "sv-SE",
            timezone: "Europe/Stockholm",
            isActive: true,
          },
        ],
        { session }
      );

      const organization = organizations[0];

      await User.create(
        [
          {
            organizationId: organization._id,
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
    });

    return {
      success: true as const,
      organizationId: createdOrganizationId,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "EMAIL_EXISTS"
    ) {
      return {
        success: false as const,
        reason: "EMAIL_EXISTS" as const,
      };
    }

    throw error;
  } finally {
    await session.endSession();
  }
}