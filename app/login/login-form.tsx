"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AlertCircle, Loader2, LogIn } from "lucide-react";

import {
  loginAction,
  type LoginState,
} from "./actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] =
    useActionState(loginAction, initialState);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [editedFields, setEditedFields] = useState({
    email: false,
    password: false,
  });

  const emailError = editedFields.email
    ? undefined
    : state.fieldErrors?.email;

  const passwordError = editedFields.password
    ? undefined
    : state.fieldErrors?.password;

  function handleEmailChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setEmail(event.target.value);

    setEditedFields((previous) => ({
      ...previous,
      email: true,
    }));
  }

  function handlePasswordChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setPassword(event.target.value);

    setEditedFields((previous) => ({
      ...previous,
      password: true,
    }));
  }

  return (
    <form
      action={formAction}
      noValidate
      className="space-y-5"
      onSubmit={() => {
        setEditedFields({
          email: false,
          password: false,
        });
      }}
    >
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
          placeholder="admin@company.com"
          value={email}
          onChange={handleEmailChange}
          aria-invalid={Boolean(emailError)}
          aria-describedby={
            emailError ? "email-error" : undefined
          }
          className={
            emailError
              ? "border-red-500 focus-visible:ring-red-500"
              : ""
          }
          disabled={pending}
        />

        {emailError ? (
          <p
            id="email-error"
            className="flex items-center gap-1.5 text-sm text-red-600"
          >
            <AlertCircle
              className="size-4 shrink-0"
              aria-hidden="true"
            />

            {emailError}
          </p>
        ) : null}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="password"
            className="text-sm font-medium text-slate-700"
          >
            Password
          </label>

          <Link
            href="/forgot-password"
            className="text-sm font-medium text-emerald-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            Forgot password?
          </Link>
        </div>

        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={handlePasswordChange}
          aria-invalid={Boolean(passwordError)}
          aria-describedby={
            passwordError ? "password-error" : undefined
          }
          className={
            passwordError
              ? "border-red-500 focus-visible:ring-red-500"
              : ""
          }
          disabled={pending}
        />

        {passwordError ? (
          <p
            id="password-error"
            className="flex items-center gap-1.5 text-sm text-red-600"
          >
            <AlertCircle
              className="size-4 shrink-0"
              aria-hidden="true"
            />

            {passwordError}
          </p>
        ) : null}
      </div>

      {/* Authentication error */}
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
            Signing in...
          </>
        ) : (
          <>
            <LogIn
              className="mr-2 size-4"
              aria-hidden="true"
            />
            Sign in
          </>
        )}
      </Button>
    </form>
  );
}