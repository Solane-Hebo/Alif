export type SupportedCalendar =
  | "gregory"
  | "ethiopic";

type FormatDateTimeOptions = {
  locale: string;
  timezone: string;
  calendar: SupportedCalendar;
};

export function formatDateTime(
  value: Date | string,
  {
    locale,
    timezone,
    calendar,
  }: FormatDateTimeOptions
) {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  try {
    const resolvedLocale =
      new Intl.Locale(locale, {
        calendar,
      }).toString();

    const formatter =
      new Intl.DateTimeFormat(
        resolvedLocale,
        {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: timezone,
        }
      );

    /*
     * Some Intl implementations include
     * an era automatically for the
     * Ethiopic calendar even when the
     * `era` option is not requested.
     *
     * formatToParts lets us remove only
     * the era without modifying the
     * actual Ethiopian date.
     */
    const parts =
      formatter.formatToParts(date);

    return parts
      .filter(
        (part) =>
          part.type !== "era"
      )
      .map((part) => part.value)
      .join("")
      /*
       * Removing the era can leave an
       * extra space before punctuation.
       */
      .replace(/\s+([,./-])/g, "$1")
      .replace(/\s{2,}/g, " ")
      .trim();
  } catch {
    return "—";
  }
}