import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";

export async function requireUser() {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId ||
    !session.user.role
  ) {
    redirect("/login");
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
    redirect("/login");
  }

  const databaseSessionVersion =
    databaseUser.sessionVersion ?? 0;

  const tokenSessionVersion =
    session.user.sessionVersion ?? 0;

  if (
    databaseSessionVersion !== tokenSessionVersion
  ) {
    redirect("/login");
  }

  return {
    id: databaseUser._id.toString(),
    organizationId:
      databaseUser.organizationId.toString(),
    role: databaseUser.role,
    name: databaseUser.name,
    email: databaseUser.email,
    sessionVersion: databaseSessionVersion,
  };
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}