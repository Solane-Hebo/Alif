"use client";

import { useActionState } from "react";
import { KeyRound, Loader2 } from "lucide-react";

import {
  resetPasswordAction,
  type ResetPasswordState,
} from "./actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ResetPasswordFormProps = {
  token: string;
};

const initialState: ResetPasswordState = {};

export function ResetPasswordForm({
  token,
}: ResetPasswordFormProps) {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5">
      <input
        type="hidden"
        name="token"
        value={token}
      />

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-slate-700"
        >
          New password
        </label>

        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={128}
          disabled={pending}
        />

        <p className="text-xs text-slate-500">
          Use at least 12 characters.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-slate-700"
        >
          Confirm new password
        </label>

        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={128}
          disabled={pending}
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
            Updating password...
          </>
        ) : (
          <>
            <KeyRound
              className="mr-2 h-4 w-4"
              aria-hidden="true"
            />
            Set new password
          </>
        )}
      </Button>
    </form>
  );
}