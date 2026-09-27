export function parseMoneyToMinorUnits(
  value: string
): number | null {
  const normalized = value
    .trim()
    .replace(/\s/g, "")
    .replace(",", ".");

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const [whole, decimal = ""] =
    normalized.split(".");

  const minor =
    Number(whole) * 100 +
    Number(decimal.padEnd(2, "0"));

  if (!Number.isSafeInteger(minor)) {
    return null;
  }

  return minor;
}

export function formatMoney(
  amount: number,
  currency = "SEK",
  locale = "sv-SE"
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount / 100);
}