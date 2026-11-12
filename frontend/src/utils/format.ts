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

const weekdayDateFormatter = new Intl.DateTimeFormat(LOCALE, {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

const paddedTimeFormatter = new Intl.DateTimeFormat(LOCALE, { hour: "2-digit", minute: "2-digit" });

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

export function formatOrderDateTime(value: string | Date): string {
  const date = new Date(value);
  return `${weekdayDateFormatter.format(date)} · ${paddedTimeFormatter.format(date)}`;
}

export function formatMonthYear(value: string | Date): string {
  return monthYearFormatter.format(new Date(value));
}

export function shortId(uuid: string): string {
  return `#${uuid.slice(0, SHORT_ID_LENGTH)}`;
}
