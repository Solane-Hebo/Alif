"use client";

import { useActionState } from "react";
import { Building2, Loader2 } from "lucide-react";

import {
  registerAction,
  type RegisterState,
} from "./actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, pending] =
    useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="organizationName"
          className="text-sm font-medium text-slate-700"
        >
          Company name
        </label>

        <Input
          id="organizationName"
          name="organizationName"
          autoComplete="organization"
          required
          maxLength={120}
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium text-slate-700"
        >
          Your name
        </label>

        <Input
          id="name"
          name="name"
          autoComplete="name"
          required
          maxLength={100}
          disabled={pending}
        />
      </div>

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
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-slate-700"
        >
          Password
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
          Confirm password
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
        className="w-full bg-emerald-600 hover:bg-emerald-700"
        disabled={pending}
      >
        {pending ? (
          <>
            <Loader2
              className="mr-2 h-4 w-4 animate-spin"
              aria-hidden="true"
            />
            Creating account...
          </>
        ) : (
          <>
            <Building2
              className="mr-2 h-4 w-4"
              aria-hidden="true"
            />
            Create company account
          </>
        )}
      </Button>
    </form>
  );
}