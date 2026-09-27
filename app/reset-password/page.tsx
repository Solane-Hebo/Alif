import Link from "next/link";
import { KeyRound } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ResetPasswordForm } from "./reset-password-form";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string | string[];
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;

  const token =
    typeof params.token === "string"
      ? params.token
      : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white"
            aria-hidden="true"
          >
            <KeyRound className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Create a new password
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Choose a new password for your account.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Reset password</CardTitle>
          </CardHeader>

          <CardContent>
            {token ? (
              <ResetPasswordForm token={token} />
            ) : (
              <div className="space-y-4">
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
                >
                  This password reset link is invalid.
                </p>

                <Link
                  href="/forgot-password"
                  className="inline-block text-sm font-medium text-emerald-700 underline-offset-4 hover:underline"
                >
                  Request a new reset link
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}