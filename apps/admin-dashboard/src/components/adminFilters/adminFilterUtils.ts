import type { ReactNode } from "react";

export const normalizeAdminSearchText = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

export const adminTextIncludes = (value: unknown, query: string) => {
  const normalizedQuery = normalizeAdminSearchText(query);
  if (!normalizedQuery) return true;
  return normalizeAdminSearchText(value).includes(normalizedQuery);
};

export const recordMatchesAdminSearch = (
  query: string,
  values: Array<string | number | boolean | null | undefined>,
) => {
  const normalizedQuery = normalizeAdminSearchText(query);
  if (!normalizedQuery) return true;
  return values.some((value) => adminTextIncludes(value, normalizedQuery));
};

export type AdminSearchableValue = string | number | boolean | null | undefined | ReactNode;
