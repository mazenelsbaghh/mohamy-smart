import { z } from 'zod';

/**
 * Validates environment variables for both Vite (VITE_*) and Next.js (NEXT_PUBLIC_*) apps.
 * Returns parsed values or falls back safely on validation failure.
 */
export function validateEnv(raw: Record<string, string | undefined>) {
  const viteSchema = z.object({
    VITE_API_BASE_URL: z.string().url(),
    VITE_SENTRY_DSN: z
      .string()
      .optional()
      .transform((val) => (val === '' ? undefined : val))
      .refine((val) => !val || val.startsWith('https://'), {
        message: 'Sentry DSN must be a valid HTTPS URL or empty string',
      }),
  });

  const nextSchema = z.object({
    NEXT_PUBLIC_API_BASE_URL: z.string().url(),
    NEXT_PUBLIC_SENTRY_DSN: z
      .string()
      .optional()
      .transform((val) => (val === '' ? undefined : val))
      .refine((val) => !val || val.startsWith('https://'), {
        message: 'Sentry DSN must be a valid HTTPS URL or empty string',
      }),
  });

  const isNext = 'NEXT_PUBLIC_API_BASE_URL' in raw;

  const result = isNext
    ? nextSchema.safeParse(raw)
    : viteSchema.safeParse(raw);

  if (!result.success) {
    console.warn('[Config] Environment validation failed:', result.error.format());
    if (isNext) {
      return {
        NEXT_PUBLIC_API_BASE_URL: raw.NEXT_PUBLIC_API_BASE_URL ?? '',
        NEXT_PUBLIC_SENTRY_DSN: undefined,
      };
    }
    return {
      VITE_API_BASE_URL: raw.VITE_API_BASE_URL ?? '',
      VITE_SENTRY_DSN: undefined,
    };
  }

  return result.data;
}
