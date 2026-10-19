export interface CurrencyInfo {
  code: string;
  name: string;
  countryCode: string; // 2-letter ISO country code for flag avatar
}

const displayNames =
  typeof Intl !== "undefined" && Intl.DisplayNames
    ? new Intl.DisplayNames(["en"], { type: "currency" })
    : null;

// Special cases where first 2 characters of currency code differ from country ISO code
const SPECIAL_FLAG_MAP: Record<string, string> = {
  EUR: "eu",
  GBP: "gb",
  USD: "us",
  AUD: "au",
  CAD: "ca",
  CHF: "ch",
  INR: "in",
  JPY: "jp",
  NZD: "nz",
  SGD: "sg",
  HKD: "hk",
  ZAR: "za",
  AED: "ae",
  SAR: "sa",
  QAR: "qa",
  KWD: "kw",
  BHD: "bh",
  OMR: "om",
  ANG: "cw",
  XOF: "sn",
  XAF: "cm",
  XCD: "ag",
};

/**
 * Dynamically resolves metadata (name, flag country code) for any currency code
 * using native ECMAScript Intl standards with zero static data files.
 */
export function getCurrencyInfo(code: string): CurrencyInfo {
  const upper = (code || "USD").toUpperCase();
  let name = upper;

  try {
    if (displayNames) {
      name = displayNames.of(upper) || upper;
    }
  } catch {
    name = upper;
  }

  const countryCode = (SPECIAL_FLAG_MAP[upper] || upper.slice(0, 2)).toLowerCase();

  return {
    code: upper,
    name,
    countryCode,
  };
}

export const DEFAULT_CURRENCY_CODE = "USD";
