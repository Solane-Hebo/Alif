import "server-only";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Organization } from "@/lib/models/organization.model";
import { User } from "@/lib/models/user.model";

export async function getAuthenticatedUser() {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId ||
    !session.user.role
  ) {
    return null;
  }

  await connectToDatabase();

  const databaseUser = await User.findOne({
    _id: session.user.id,
    organizationId: session.user.organizationId,
    isActive: true,
  })
    .select(
      "_id organizationId role sessionVersion name email"
    )
    .lean();

  if (!databaseUser) {
    return null;
  }

  const organization = await Organization.findOne({
    _id: databaseUser.organizationId,
    isActive: true,
  })
    .select("_id")
    .lean();

  if (!organization) {
    return null;
  }

  const databaseSessionVersion =
    databaseUser.sessionVersion ?? 0;

  const tokenSessionVersion =
    session.user.sessionVersion ?? 0;

  if (
    databaseSessionVersion !==
    tokenSessionVersion
  ) {
    return null;
  }

  if (
    databaseUser.role !== "ADMIN" &&
    databaseUser.role !== "STAFF"
  ) {
    return null;
  }

  return {
    id: databaseUser._id.toString(),
    organizationId:
      databaseUser.organizationId.toString(),
    role: databaseUser.role as "ADMIN" | "STAFF",
    name: databaseUser.name,
    email: databaseUser.email,
    sessionVersion: databaseSessionVersion,
  };
}