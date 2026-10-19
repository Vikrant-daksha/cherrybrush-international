import { connectDB } from "@/lib/db";
import ExchangeRate, { IExchangeRate } from "@/lib/exchangeRate.model";
import { getStoreBaseCurrency } from "@/lib/storeSettings";

const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 Hours in milliseconds

export interface ExchangeRatesResult {
  baseCurrency: string;
  rates: Record<string, number>;
  provider: string;
  lastFetchedAt: Date;
  isStale: boolean;
  refreshed: boolean;
}

/**
 * Fetch latest rates from an external exchange rate provider.
 * Supports ExchangeRate-API (free without key, or authenticated if key provided).
 */
export async function fetchExternalRates(
  baseCurrency: string = "USD"
): Promise<{ rates: Record<string, number>; provider: string }> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  // Use authenticated endpoint if key is configured, otherwise fallback to the free open endpoint
  const url = apiKey
    ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`
    : `https://open.er-api.com/v6/latest/${baseCurrency}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    // Cache control at fetch level to avoid edge caching stale errors
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Exchange rate API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  // ExchangeRate-API returns rates under 'rates' or 'conversion_rates'
  const rates: Record<string, number> =
    data.rates || data.conversion_rates || {};

  if (!rates || Object.keys(rates).length === 0) {
    throw new Error("Invalid or empty rates received from provider");
  }

  return {
    rates,
    provider: apiKey ? "v6.exchangerate-api.com" : "open.er-api.com",
  };
}

/**
 * Retrieves exchange rates from MongoDB.
 * If rates don't exist OR are older than 24 hours, it fetches fresh rates and overwrites the document.
 *
 * @param baseCurrency - The base currency code (default: USD)
 * @param forceRefresh - If true, bypasses the 24-hour check and immediately refreshes
 */
export async function getExchangeRates(
  baseCurrency?: string,
  forceRefresh: boolean = false
): Promise<ExchangeRatesResult> {
  await connectDB();

  const resolvedBase = baseCurrency || (await getStoreBaseCurrency());
  const normalizedBase = resolvedBase.toUpperCase().trim();

  // 1. Check for existing document in MongoDB
  const existingDoc: IExchangeRate | null = await ExchangeRate.findOne({
    baseCurrency: normalizedBase,
  });

  const now = Date.now();
  const lastFetched = existingDoc?.lastFetchedAt
    ? new Date(existingDoc.lastFetchedAt).getTime()
    : 0;

  const isStale = !existingDoc || now - lastFetched >= REFRESH_INTERVAL_MS;

  // 2. Return cached DB data if still valid and force refresh is not requested
  if (!isStale && !forceRefresh && existingDoc) {
    return {
      baseCurrency: existingDoc.baseCurrency,
      rates: existingDoc.rates,
      provider: existingDoc.provider,
      lastFetchedAt: existingDoc.lastFetchedAt,
      isStale: false,
      refreshed: false,
    };
  }

  // 3. Stale or forced: Fetch new rates and re-write the document
  try {
    const { rates, provider } = await fetchExternalRates(normalizedBase);

    // Overwrite the single document in MongoDB for this base currency (Upsert)
    const updatedDoc = await ExchangeRate.findOneAndUpdate(
      { baseCurrency: normalizedBase },
      {
        $set: {
          rates,
          provider,
          lastFetchedAt: new Date(),
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      }
    );

    return {
      baseCurrency: updatedDoc.baseCurrency,
      rates: updatedDoc.rates,
      provider: updatedDoc.provider,
      lastFetchedAt: updatedDoc.lastFetchedAt,
      isStale: false,
      refreshed: true,
    };
  } catch (error) {
    console.error("⚠️ Failed to refresh exchange rates:", error);

    // Resilience Fallback: If external API fails, keep serving existing DB rates rather than breaking checkout!
    if (existingDoc) {
      console.warn("⚠️ Serving stale rates from MongoDB as fallback.");
      return {
        baseCurrency: existingDoc.baseCurrency,
        rates: existingDoc.rates,
        provider: existingDoc.provider,
        lastFetchedAt: existingDoc.lastFetchedAt,
        isStale: true,
        refreshed: false,
      };
    }

    throw error;
  }
}

/**
 * Utility function to convert an amount between two currencies using rates from a base currency.
 *
 * Example:
 * convertAmount(100, "USD", "EUR", rates) -> 92.5
 */
export function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>,
  baseCurrency: string = "USD"
): number {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  const base = baseCurrency.toUpperCase();

  if (from === to) return amount;

  // Rate relative to base currency
  const fromRate = from === base ? 1 : rates[from];
  const toRate = to === base ? 1 : rates[to];

  if (!fromRate || !toRate) {
    throw new Error(`Missing exchange rate for ${from} or ${to}`);
  }

  // Convert from source currency to base, then base to target currency
  const amountInBase = amount / fromRate;
  const converted = amountInBase * toRate;

  return Math.round((converted + Number.EPSILON) * 100) / 100;
}
