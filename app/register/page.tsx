import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";

import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white"
            aria-hidden="true"
          >
            <BarChart3 className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Create your company account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create your workspace and administrator
            account.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Get started</CardTitle>
          </CardHeader>

          <CardContent>
            <RegisterForm />

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-emerald-700 underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}