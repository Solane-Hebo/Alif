import { DateTime } from "luxon";

export function getDateRangeInTimezone(
  fromValue: string,
  toValue: string,
  timezone: string
) {
  const fromLocal = DateTime.fromISO(
    fromValue,
    {
      zone: timezone,
    }
  ).startOf("day");

  const toLocal = DateTime.fromISO(
    toValue,
    {
      zone: timezone,
    }
  ).endOf("day");

  if (
    !fromLocal.isValid ||
    !toLocal.isValid ||
    fromLocal > toLocal
  ) {
    return null;
  }

  return {
    from: fromLocal.toUTC().toJSDate(),
    to: toLocal.toUTC().toJSDate(),
  };
}