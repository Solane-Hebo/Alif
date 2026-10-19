"use client";

import { useActionState } from "react";
import {
  Building2,
  Loader2,
} from "lucide-react";

import {
  registerAction,
  type RegisterState,
} from "./actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, pending] =
    useActionState(
      registerAction,
      initialState
    );

  return (
    <form
      action={formAction}
      className="space-y-5"
    >
      {/* Company */}
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

      {/* Admin name */}
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

      {/* Email */}
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

      {/* Organization settings */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Company settings
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Choose how money, dates and
            times should be displayed.
          </p>
        </div>

        <div className="space-y-4">
          {/* Currency */}
          <div className="space-y-2">
            <label
              htmlFor="currency"
              className="text-sm font-medium text-slate-700"
            >
              Currency
            </label>

            <select
              id="currency"
              name="currency"
              defaultValue="ETB"
              required
              disabled={pending}
              className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="ETB">
                Ethiopian Birr (ETB)
              </option>

              <option value="SEK">
                Swedish Krona (SEK)
              </option>

              <option value="USD">
                US Dollar (USD)
              </option>

              <option value="EUR">
                Euro (EUR)
              </option>
            </select>
          </div>

          {/* Locale */}
          <div className="space-y-2">
            <label
              htmlFor="locale"
              className="text-sm font-medium text-slate-700"
            >
              Regional format
            </label>

            <select
              id="locale"
              name="locale"
              defaultValue="en-ET"
              required
              disabled={pending}
              className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="en-ET">
                Ethiopia — English
              </option>

              <option value="am-ET">
                Ethiopia — Amharic
              </option>

              <option value="sv-SE">
                Sweden — Swedish
              </option>

              <option value="en-US">
                United States — English
              </option>
            </select>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <label
              htmlFor="timezone"
              className="text-sm font-medium text-slate-700"
            >
              Timezone
            </label>

            <select
              id="timezone"
              name="timezone"
              defaultValue="Africa/Addis_Ababa"
              required
              disabled={pending}
              className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Africa/Addis_Ababa">
                Addis Ababa
              </option>

              <option value="Europe/Stockholm">
                Stockholm
              </option>

              <option value="America/New_York">
                New York
              </option>

              <option value="UTC">
                UTC
              </option>
            </select>
          </div>

          {/* Calendar */}
          <div className="space-y-2">
            <label
              htmlFor="calendar"
              className="text-sm font-medium text-slate-700"
            >
              Calendar
            </label>

            <select
              id="calendar"
              name="calendar"
              defaultValue="ethiopic"
              required
              disabled={pending}
              className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="ethiopic">
                Ethiopian calendar
              </option>

              <option value="gregory">
                Gregorian calendar
              </option>
            </select>

            <p className="text-xs text-slate-500">
              Controls how dates are displayed.
              Stored timestamps remain unchanged.
            </p>
          </div>
        </div>
      </div>

      {/* Password */}
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

      {/* Confirm password */}
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

      {/* Error */}
      {state.error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.error}
        </p>
      ) : null}

      {/* Submit */}
      <Button
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700"
        disabled={pending}
      >
        {pending ? (
          <>
            <Loader2
              className="mr-2 size-4 animate-spin"
              aria-hidden="true"
            />
            Creating account...
          </>
        ) : (
          <>
            <Building2
              className="mr-2 size-4"
              aria-hidden="true"
            />
            Create company account
          </>
        )}
      </Button>
    </form>
  );
}