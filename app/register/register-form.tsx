"use client";

import {
  useActionState,
  useState,
  type ReactNode,
} from "react";

import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
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

type FormValues = {
  organizationName: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type EditableField = keyof FormValues;

type FieldProps = {
  id: EditableField;
  label: string;
  error?: string;
  children: ReactNode;
  description?: ReactNode;
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
        <div id={`${id}-description`}>
          {description}
        </div>
      ) : null}
    </div>
  );
}

const initialValues: FormValues = {
  organizationName: "",
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function RegisterForm() {
  const [state, formAction, pending] =
    useActionState(registerAction, initialState);

  const [values, setValues] =
    useState<FormValues>(initialValues);

  const [touched, setTouched] = useState<
    Partial<Record<EditableField, boolean>>
  >({});

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const passwordLengthValid =
    values.password.length >= 12;

  const passwordsMatch =
    values.confirmPassword.length > 0 &&
    values.password === values.confirmPassword;

  function updateField(
    field: EditableField,
    value: string
  ) {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));

    setTouched((previous) => ({
      ...previous,
      [field]: true,
    }));
  }

  function getError(field: EditableField) {
    const value = values[field];

    if (touched[field]) {
      if (
        field === "organizationName" &&
        value.trim().length < 2
      ) {
        return value.trim().length === 0
          ? "Company name is required."
          : "Company name must be at least 2 characters.";
      }

      if (
        field === "name" &&
        value.trim().length < 2
      ) {
        return value.trim().length === 0
          ? "Your name is required."
          : "Name must be at least 2 characters.";
      }

      if (field === "email") {
        if (!value.trim()) {
          return "Email address is required.";
        }

        if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
        ) {
          return "Enter a valid email address.";
        }
      }

      if (field === "password") {
        if (!value) {
          return "Password is required.";
        }

        if (value.length < 12) {
          return "Password must be at least 12 characters.";
        }

        if (value.length > 128) {
          return "Password is too long.";
        }
      }

      if (field === "confirmPassword") {
        if (!value) {
          return "Please confirm your password.";
        }

        if (value !== values.password) {
          return "Passwords do not match.";
        }
      }

      return undefined;
    }

    return state.fieldErrors?.[field];
  }

  function fieldAccessibility(field: EditableField) {
    const error = getError(field);

    return {
      "aria-invalid": Boolean(error),
      "aria-describedby": error
        ? `${field}-error`
        : field === "password"
          ? "password-description"
          : undefined,
    };
  }

  function errorClass(field: EditableField) {
    return getError(field)
      ? "border-red-500 focus-visible:ring-red-500"
      : "";
  }

  return (
    <form
      action={formAction}
      noValidate
      className="space-y-5"
    >
      {/* Company name */}
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
          value={values.organizationName}
          onChange={(event) =>
            updateField(
              "organizationName",
              event.target.value
            )
          }
          disabled={pending}
          {...fieldAccessibility("organizationName")}
          className={errorClass("organizationName")}
        />
      </FormField>

      {/* Admin name */}
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
          value={values.name}
          onChange={(event) =>
            updateField("name", event.target.value)
          }
          disabled={pending}
          {...fieldAccessibility("name")}
          className={errorClass("name")}
        />
      </FormField>

      {/* Email */}
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
          value={values.email}
          onChange={(event) =>
            updateField("email", event.target.value)
          }
          disabled={pending}
          {...fieldAccessibility("email")}
          className={errorClass("email")}
        />
      </FormField>

      {/* Password */}
      <FormField
        id="password"
        label="Password"
        error={getError("password")}
        description={
          <div className="space-y-2">
            <p className="text-xs text-slate-500">
              Use at least 12 characters.
            </p>

            {values.password.length > 0 && (
              <p
                className={`flex items-center gap-1.5 text-xs ${
                  passwordLengthValid
                    ? "text-emerald-700"
                    : "text-slate-500"
                }`}
              >
                {passwordLengthValid ? (
                  <CheckCircle2
                    className="size-4"
                    aria-hidden="true"
                  />
                ) : (
                  <AlertCircle
                    className="size-4"
                    aria-hidden="true"
                  />
                )}

                {passwordLengthValid
                  ? "Password meets the minimum length."
                  : `${values.password.length} of 12 characters`}
              </p>
            )}
          </div>
        }
      >
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={
              showPassword ? "text" : "password"
            }
            autoComplete="new-password"
            maxLength={128}
            value={values.password}
            onChange={(event) =>
              updateField(
                "password",
                event.target.value
              )
            }
            disabled={pending}
            {...fieldAccessibility("password")}
            className={`pr-12 ${errorClass("password")}`}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword((previous) => !previous)
            }
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff
                className="size-4"
                aria-hidden="true"
              />
            ) : (
              <Eye
                className="size-4"
                aria-hidden="true"
              />
            )}
          </button>
        </div>
      </FormField>

      {/* Confirm password */}
      <FormField
        id="confirmPassword"
        label="Confirm password"
        error={getError("confirmPassword")}
        description={
          passwordsMatch ? (
            <p className="flex items-center gap-1.5 text-xs text-emerald-700">
              <CheckCircle2
                className="size-4"
                aria-hidden="true"
              />
              Passwords match.
            </p>
          ) : undefined
        }
      >
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            autoComplete="new-password"
            maxLength={128}
            value={values.confirmPassword}
            onChange={(event) =>
              updateField(
                "confirmPassword",
                event.target.value
              )
            }
            disabled={pending}
            {...fieldAccessibility("confirmPassword")}
            className={`pr-12 ${errorClass("confirmPassword")}`}
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(
                (previous) => !previous
              )
            }
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            aria-label={
              showConfirmPassword
                ? "Hide confirmation password"
                : "Show confirmation password"
            }
            aria-pressed={showConfirmPassword}
          >
            {showConfirmPassword ? (
              <EyeOff
                className="size-4"
                aria-hidden="true"
              />
            ) : (
              <Eye
                className="size-4"
                aria-hidden="true"
              />
            )}
          </button>
        </div>
      </FormField>

      {/* Server error */}
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