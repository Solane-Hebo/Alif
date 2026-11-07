"use client";

import { useActionState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
} from "lucide-react";

import {
  forgotPasswordAction,
  type ForgotPasswordState,
} from "./actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] =
    useActionState(
      forgotPasswordAction,
      initialState
    );

  if (state.success) {
    return (
      <div
        role="status"
        className="rounded-xl border border-emerald-200 bg-emerald-50 p-5"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="mt-0.5 size-5 shrink-0 text-emerald-600"
            aria-hidden="true"
          />

          <div>
            <h2 className="font-semibold text-emerald-900">
              Request received
            </h2>

            <p className="mt-2 text-sm leading-6 text-emerald-800">
              If an account exists for that email address,
              password reset instructions have been sent.
            </p>

            <p className="mt-2 text-xs text-emerald-700">
              Please check your inbox and spam folder.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      className="space-y-5"
    >
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-slate-700"
        >
          Email address
        </label>

        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          disabled={pending}
          placeholder="you@company.com"
          aria-invalid={Boolean(state.error)}
          aria-describedby={
            state.error ? "forgot-password-error" : undefined
          }
          className={
            state.error
              ? "border-red-500 focus-visible:ring-red-500"
              : ""
          }
        />

        <p className="text-xs text-slate-500">
          Enter the email associated with your account.
        </p>
      </div>

      {state.error ? (
        <div
          id="forgot-password-error"
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700"
        >
          <AlertCircle
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />

          <p>{state.error}</p>
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        {pending ? (
          <>
            <Loader2
              className="mr-2 size-4 animate-spin"
              aria-hidden="true"
            />
            Sending instructions...
          </>
        ) : (
          <>
            <Mail
              className="mr-2 size-4"
              aria-hidden="true"
            />
            Send reset instructions
          </>
        )}
      </Button>
    </form>
  );
}