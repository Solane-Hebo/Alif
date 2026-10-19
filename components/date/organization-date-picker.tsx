"use client";

import {
  DayPicker as GregorianDayPicker,
} from "@daypicker/react";

import {
  DayPicker as EthiopicDayPicker,
} from "@daypicker/ethiopic";

import type {
  SupportedCalendar,
} from "@/lib/utils/date-format";

type OrganizationDatePickerProps = {
  calendar: SupportedCalendar;
  selected?: Date;
  onSelect: (date?: Date) => void;
  disabled?: boolean;
};

export function OrganizationDatePicker({
  calendar,
  selected,
  onSelect,
  disabled = false,
}: OrganizationDatePickerProps) {
  const commonProps = {
    mode: "single" as const,
    selected,
    onSelect,
    disabled: disabled
      ? (() => true)
      : undefined,
    showOutsideDays: true,
  };

  if (calendar === "ethiopic") {
    return (
      <div className="organization-date-picker">
        <EthiopicDayPicker
          {...commonProps}
          numerals="latn"
        />
      </div>
    );
  }

  return (
    <div className="organization-date-picker">
      <GregorianDayPicker
        {...commonProps}
      />
    </div>
  );
}