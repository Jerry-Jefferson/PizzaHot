import type { LocationQueryValue } from "vue-router";

export type RouteQueryValue = LocationQueryValue | LocationQueryValue[] | undefined;

export function firstQueryValue(value: RouteQueryValue): string {
  const first = Array.isArray(value) ? value[0] : value;
  return first ?? "";
}

export function parsePageQuery(value: RouteQueryValue): number {
  const page = Number(firstQueryValue(value));
  return Number.isInteger(page) && page > 1 ? page : 1;
}

export function parseEnumQuery<T extends string>(
  value: RouteQueryValue,
  allowed: readonly T[]
): T | "" {
  const first = firstQueryValue(value);
  return allowed.find((option) => option === first) ?? "";
}

const MONTH_QUERY_PATTERN = /^(\d{4})-(\d{2})$/;
const MIN_MONTH_QUERY_YEAR = 2000;

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function toMonthQuery(date: Date): string {
  return `${String(date.getFullYear())}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function parseMonthQuery(value: RouteQueryValue, now: Date = new Date()): Date {
  const currentMonth = startOfMonth(now);
  const match = MONTH_QUERY_PATTERN.exec(firstQueryValue(value));
  if (!match) {
    return currentMonth;
  }
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (year < MIN_MONTH_QUERY_YEAR || monthIndex < 0 || monthIndex > 11) {
    return currentMonth;
  }
  const month = new Date(year, monthIndex, 1);
  return month > currentMonth ? currentMonth : month;
}
