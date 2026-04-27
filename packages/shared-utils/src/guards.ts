/** Type guard: checks if value is a string (including empty strings) */
export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

/** Type guard: checks if value is a non-null object */
export const isObject = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};
