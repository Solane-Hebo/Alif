import Link from "next/link";
import { KeyRound } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
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
            Forgot your password?
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Enter your email address and we&apos;ll
            send you instructions to reset your
            password.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Reset password</CardTitle>
          </CardHeader>

          <CardContent>
            <ForgotPasswordForm />

            <p className="mt-6 text-center text-sm">
              <Link
                href="/login"
                className="font-medium text-emerald-700 underline-offset-4 hover:underline"
              >
                Back to sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}