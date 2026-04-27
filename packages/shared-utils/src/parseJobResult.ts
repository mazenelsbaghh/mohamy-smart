/** Converts a snake_case key to camelCase. */
const snakeToCamel = (key: string): string =>
  key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

/** Converts a PascalCase key to camelCase. */
const toCamelKey = (key: string): string =>
  key.charAt(0).toLowerCase() + key.slice(1);

/**
 * Recursively converts all object keys from PascalCase/snake_case to camelCase.
 * Handles the .NET backend's inconsistent casing in JSON responses.
 */
export function deepCamelize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(deepCamelize);
  }
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [toCamelKey(snakeToCamel(k)), deepCamelize(v)])
    );
  }
  return value;
}

/**
 * Parses a resultJson string from an AiJob.
 * Automatically normalises keys to camelCase.
 */
export function parseJobResult<T = unknown>(resultJson: string | null | undefined): T | null {
  if (!resultJson) return null;
  try {
    const parsed = JSON.parse(resultJson) as Record<string, unknown>;
    if (typeof parsed === 'object' && parsed !== null) {
      return deepCamelize(parsed) as T;
    }
    return parsed as T;
  } catch {
    return null;
  }
}

/**
 * Parses a workflow step's resultJson, unwrapping the outer { stepNumber, output } wrapper.
 */
export function parseWorkflowJobResult<T = unknown>(
  resultJson: string | null | undefined
): T | null {
  const outer = parseJobResult<{ output?: unknown; stepNumber?: unknown }>(resultJson);
  if (!outer) return null;
  if (typeof outer.output === 'string' && typeof outer.stepNumber === 'number') {
    return parseJobResult<T>(outer.output);
  }
  return outer as T;
}
