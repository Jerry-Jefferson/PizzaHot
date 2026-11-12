const LOCALE = "en-US";
const SHORT_ID_LENGTH = 8;

const priceFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const monthYearFormatter = new Intl.DateTimeFormat(LOCALE, { month: "short", year: "numeric" });

export function formatPrice(value: number | string): string {
  return priceFormatter.format(Number(value));
}

export function formatDate(value: string | Date): string {
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | Date): string {
  return dateTimeFormatter.format(new Date(value));
}

export function formatMonthYear(value: string | Date): string {
  return monthYearFormatter.format(new Date(value));
}

export function shortId(uuid: string): string {
  return `#${uuid.slice(0, SHORT_ID_LENGTH)}`;
}
