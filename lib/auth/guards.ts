import "server-only";

import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";

export async function requireUser() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}