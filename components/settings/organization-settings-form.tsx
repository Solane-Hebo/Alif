"use client";

import {
  useActionState,
} from "react";

import {
  updateSettingsAction,
  type SettingsActionState,
} from "@/app/settings/actions";

type OrganizationSettingsFormProps = {
  organization: {
    name: string;
    currency: string;
    locale: string;
    timezone: string;
    calendar:
      | "gregory"
      | "ethiopic";
  };
};

const initialState: SettingsActionState = {
  success: false,
  message: "",
};

export function OrganizationSettingsForm({
  organization,
}: OrganizationSettingsFormProps) {
  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    updateSettingsAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className="max-w-2xl space-y-6 rounded-xl border bg-white p-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Organization
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Configure your company and
          regional settings.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium text-slate-700"
        >
          Company name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={
            organization.name
          }
          className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
            required
            disabled={pending}
            defaultValue={
              organization.currency
            }
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="ETB">
              ETB — Ethiopian Birr
            </option>

            <option value="SEK">
              SEK — Swedish Krona
            </option>

            <option value="USD">
              USD — US Dollar
            </option>

            <option value="EUR">
              EUR — Euro
            </option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="locale"
            className="text-sm font-medium text-slate-700"
          >
            Locale
          </label>

          <select
            id="locale"
            name="locale"
            required
            disabled={pending}
            defaultValue={
              organization.locale
            }
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="en-ET">
              English (Ethiopia)
            </option>

            <option value="am-ET">
              Amharic (Ethiopia)
            </option>

            <option value="sv-SE">
              Swedish (Sweden)
            </option>

            <option value="en-US">
              English (US)
            </option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
            required
            disabled={pending}
            defaultValue={
              organization.timezone
            }
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Africa/Addis_Ababa">
              Africa/Addis_Ababa
            </option>

            <option value="Europe/Stockholm">
              Europe/Stockholm
            </option>

            <option value="America/New_York">
              America/New_York
            </option>

            <option value="UTC">
              UTC
            </option>
          </select>
        </div>

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
            required
            disabled={pending}
            defaultValue={
              organization.calendar
            }
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="gregory">
              Gregorian calendar
            </option>

            <option value="ethiopic">
              Ethiopian calendar
            </option>
          </select>

          <p className="text-xs text-slate-500">
            Controls how dates are
            displayed. Stored timestamps
            remain unchanged.
          </p>
        </div>
      </div>

      {state.message ? (
        <p
          role={
            state.success
              ? "status"
              : "alert"
          }
          className={
            state.success
              ? "text-sm text-emerald-700"
              : "text-sm text-red-600"
          }
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-10 rounded-md bg-emerald-600 px-5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? "Saving..."
          : "Save settings"}
      </button>
    </form>
  );
}