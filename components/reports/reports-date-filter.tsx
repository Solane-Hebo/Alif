"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";

import { OrganizationDatePicker } from "@/components/date/organization-date-picker";

import type { SupportedCalendar } from "@/lib/utils/date-format";

type ReportsDateFilterProps = {
  fromValue: string;
  toValue: string;
  calendar: SupportedCalendar;
  locale: string;
};

function parseIsoDate(
  value: string
): Date | undefined {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      value
    );

  if (!match) {
    return undefined;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(
    year,
    month - 1,
    day,
    12,
    0,
    0
  );

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}

function toIsoDate(
  date: Date
): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatSelectedDate(
  date: Date | undefined,
  locale: string,
  calendar: SupportedCalendar
) {
  if (!date) {
    return "Select date";
  }

  try {
    const resolvedLocale =
      new Intl.Locale(locale, {
        calendar,
      }).toString();

    return new Intl.DateTimeFormat(
      resolvedLocale,
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    ).format(date);
  } catch {
    return toIsoDate(date);
  }
}

export function ReportsDateFilter({
  fromValue,
  toValue,
  calendar,
  locale,
}: ReportsDateFilterProps) {
  const [fromDate, setFromDate] =
    useState<Date | undefined>(() =>
      parseIsoDate(fromValue)
    );

  const [toDate, setToDate] =
    useState<Date | undefined>(() =>
      parseIsoDate(toValue)
    );

  const [openPicker, setOpenPicker] =
    useState<"from" | "to" | null>(
      null
    );

  return (
    <form
      method="GET"
      className="flex flex-wrap items-end gap-4 rounded-xl border bg-white p-4"
    >
      <div className="relative space-y-2">
        <label
          htmlFor="from-date-button"
          className="block text-sm font-medium text-slate-700"
        >
          From
        </label>

        <input
          type="hidden"
          name="from"
          value={
            fromDate
              ? toIsoDate(fromDate)
              : ""
          }
        />

        <button
          id="from-date-button"
          type="button"
          aria-haspopup="dialog"
          aria-expanded={
            openPicker === "from"
          }
          onClick={() =>
            setOpenPicker((current) =>
              current === "from"
                ? null
                : "from"
            )
          }
          className="flex h-9 min-w-52 items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <span>
            {formatSelectedDate(
              fromDate,
              locale,
              calendar
            )}
          </span>

          <CalendarDays
            className="size-4 shrink-0 text-slate-500"
            aria-hidden="true"
          />
        </button>

        {openPicker === "from" ? (
          <div
            role="dialog"
            aria-label="Select start date"
            className="absolute left-0 top-full z-50 mt-2 rounded-xl border bg-white p-3 shadow-xl"
          >
            <OrganizationDatePicker
              calendar={calendar}
              selected={fromDate}
              onSelect={(date) => {
                if (!date) {
                  return;
                }

                setFromDate(date);
                setOpenPicker(null);
              }}
            />
          </div>
        ) : null}
      </div>

      <div className="relative space-y-2">
        <label
          htmlFor="to-date-button"
          className="block text-sm font-medium text-slate-700"
        >
          To
        </label>

        <input
          type="hidden"
          name="to"
          value={
            toDate
              ? toIsoDate(toDate)
              : ""
          }
        />

        <button
          id="to-date-button"
          type="button"
          aria-haspopup="dialog"
          aria-expanded={
            openPicker === "to"
          }
          onClick={() =>
            setOpenPicker((current) =>
              current === "to"
                ? null
                : "to"
            )
          }
          className="flex h-9 min-w-52 items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <span>
            {formatSelectedDate(
              toDate,
              locale,
              calendar
            )}
          </span>

          <CalendarDays
            className="size-4 shrink-0 text-slate-500"
            aria-hidden="true"
          />
        </button>

        {openPicker === "to" ? (
          <div
            role="dialog"
            aria-label="Select end date"
            className="absolute left-0 top-full z-50 mt-2 rounded-xl border bg-white p-3 shadow-xl"
          >
            <OrganizationDatePicker
              calendar={calendar}
              selected={toDate}
              onSelect={(date) => {
                if (!date) {
                  return;
                }

                setToDate(date);
                setOpenPicker(null);
              }}
            />
          </div>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={
          !fromDate ||
          !toDate ||
          fromDate > toDate
        }
        className="h-9 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Apply filter
      </button>

      {fromDate &&
      toDate &&
      fromDate > toDate ? (
        <p
          role="alert"
          className="w-full text-sm text-red-600"
        >
          The start date must be before
          or equal to the end date.
        </p>
      ) : null}
    </form>
  );
}