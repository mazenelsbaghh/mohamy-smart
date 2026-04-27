const EASTERN_ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/**
 * Converts Eastern Arabic / Persian digits to Western Arabic (0-9).
 * Useful for phone number inputs in RTL forms.
 */
export const normalizeDigits = (value: string): string => {
  return Array.from(value)
    .map((char) => {
      const easternArabicIndex = EASTERN_ARABIC_DIGITS.indexOf(char);
      if (easternArabicIndex >= 0) return easternArabicIndex.toString();

      const persianIndex = PERSIAN_DIGITS.indexOf(char);
      if (persianIndex >= 0) return persianIndex.toString();

      return char;
    })
    .join('');
};
