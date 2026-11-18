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
