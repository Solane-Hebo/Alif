"use client";

import {
  useActionState,
  useState,
  type ReactNode,
} from "react";

import {
  AlertCircle,
  Building2,
  Loader2,
} from "lucide-react";

import {
  registerAction,
  type RegisterField,
  type RegisterState,
} from "./actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: RegisterState = {};

type FieldProps = {
  id: RegisterField;
  label: string;
  error?: string;
  children: ReactNode;
  description?: string;
};

function FormField({
  id,
  label,
  error,
  children,
  description,
}: FieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      {children}

      {error ? (
        <p
          id={`${id}-error`}
          className="flex items-center gap-1.5 text-sm text-red-600"
        >
          <AlertCircle
            className="size-4 shrink-0"
            aria-hidden="true"
          />
          {error}
        </p>
      ) : description ? (
        <p
          id={`${id}-description`}
          className="text-xs text-slate-500"
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

const selectClassName =
  "h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

export function RegisterForm() {
  const [state, formAction, pending] =
    useActionState(registerAction, initialState);

  const [editedFields, setEditedFields] = useState<
    Partial<Record<RegisterField, boolean>>
  >({});

  function getError(field: RegisterField) {
    return editedFields[field]
      ? undefined
      : state.fieldErrors?.[field];
  }

  function markEdited(field: RegisterField) {
    setEditedFields((previous) => ({
      ...previous,
      [field]: true,
    }));
  }

  function fieldAccessibility(field: RegisterField) {
    const error = getError(field);

    return {
      "aria-invalid": Boolean(error) as boolean,
      "aria-describedby": error
        ? `${field}-error`
        : undefined,
    };
  }

  function errorClass(field: RegisterField) {
    return getError(field)
      ? "border-red-500 focus-visible:ring-red-500"
      : "";
  }

  return (
    <form
      action={formAction}
      noValidate
      className="space-y-5"
      onSubmit={() => setEditedFields({})}
    >
      <FormField
        id="organizationName"
        label="Company name"
        error={getError("organizationName")}
      >
        <Input
          id="organizationName"
          name="organizationName"
          autoComplete="organization"
          maxLength={120}
          disabled={pending}
          onChange={() => markEdited("organizationName")}
          {...fieldAccessibility("organizationName")}
          className={errorClass("organizationName")}
        />
      </FormField>

      <FormField
        id="name"
        label="Your name"
        error={getError("name")}
      >
        <Input
          id="name"
          name="name"
          autoComplete="name"
          maxLength={100}
          disabled={pending}
          onChange={() => markEdited("name")}
          {...fieldAccessibility("name")}
          className={errorClass("name")}
        />
      </FormField>

      <FormField
        id="email"
        label="Email"
        error={getError("email")}
      >
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          disabled={pending}
          onChange={() => markEdited("email")}
          {...fieldAccessibility("email")}
          className={errorClass("email")}
        />
      </FormField>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Company settings
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Choose how money, dates and times should be displayed.
          </p>
        </div>

        <div className="space-y-4">
          <FormField
            id="currency"
            label="Currency"
            error={getError("currency")}
          >
            <select
              id="currency"
              name="currency"
              defaultValue="ETB"
              disabled={pending}
              onChange={() => markEdited("currency")}
              {...fieldAccessibility("currency")}
              className={`${selectClassName} ${errorClass("currency")}`}
            >
              <option value="ETB">Ethiopian Birr (ETB)</option>
              <option value="SEK">Swedish Krona (SEK)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </FormField>

          <FormField
            id="locale"
            label="Regional format"
            error={getError("locale")}
          >
            <select
              id="locale"
              name="locale"
              defaultValue="en-ET"
              disabled={pending}
              onChange={() => markEdited("locale")}
              {...fieldAccessibility("locale")}
              className={`${selectClassName} ${errorClass("locale")}`}
            >
              <option value="en-ET">Ethiopia — English</option>
              <option value="am-ET">Ethiopia — Amharic</option>
              <option value="sv-SE">Sweden — Swedish</option>
              <option value="en-US">United States — English</option>
            </select>
          </FormField>

          <FormField
            id="timezone"
            label="Timezone"
            error={getError("timezone")}
          >
            <select
              id="timezone"
              name="timezone"
              defaultValue="Africa/Addis_Ababa"
              disabled={pending}
              onChange={() => markEdited("timezone")}
              {...fieldAccessibility("timezone")}
              className={`${selectClassName} ${errorClass("timezone")}`}
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
              <option value="UTC">UTC</option>
            </select>
          </FormField>

          <FormField
            id="calendar"
            label="Calendar"
            error={getError("calendar")}
            description="Controls how dates are displayed. Stored timestamps remain unchanged."
          >
            <select
              id="calendar"
              name="calendar"
              defaultValue="ethiopic"
              disabled={pending}
              onChange={() => markEdited("calendar")}
              {...fieldAccessibility("calendar")}
              className={`${selectClassName} ${errorClass("calendar")}`}
            >
              <option value="ethiopic">
                Ethiopian calendar
              </option>
              <option value="gregory">
                Gregorian calendar
              </option>
            </select>
          </FormField>
        </div>
      </div>

      <FormField
        id="password"
        label="Password"
        error={getError("password")}
        description="Use at least 12 characters."
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          maxLength={128}
          disabled={pending}
          onChange={() => markEdited("password")}
          {...fieldAccessibility("password")}
          className={errorClass("password")}
        />
      </FormField>

      <FormField
        id="confirmPassword"
        label="Confirm password"
        error={getError("confirmPassword")}
      >
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          disabled={pending}
          onChange={() => markEdited("confirmPassword")}
          {...fieldAccessibility("confirmPassword")}
          className={errorClass("confirmPassword")}
        />
      </FormField>

      {state.error ? (
        <div
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