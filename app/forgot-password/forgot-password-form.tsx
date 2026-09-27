"use client";

import { useActionState } from "react";
import { Loader2, Mail } from "lucide-react";

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
        className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800"
      >
        If an account exists for that email address,
        password reset instructions have been sent.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-slate-700"
        >
          Email
        </label>

        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
          placeholder="you@company.com"
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        {pending ? (
          <>
            <Loader2
              className="mr-2 h-4 w-4 animate-spin"
              aria-hidden="true"
            />
            Sending...
          </>
        ) : (
          <>
            <Mail
              className="mr-2 h-4 w-4"
              aria-hidden="true"
            />
            Send reset instructions
          </>
        )}
      </Button>
    </form>
  );
}