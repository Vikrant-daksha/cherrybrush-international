"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import {
  CurrencyInfo,
  getCurrencyInfo,
  DEFAULT_CURRENCY_CODE,
} from "@/lib/currencies";

interface ConvertedPrice {
  value: number;
  formatted: string;
  code: string;
}

interface CurrencyContextType {
  selectedCurrency: CurrencyInfo;
  setSelectedCurrency: (currency: CurrencyInfo) => void;
  storeBaseCurrency: string;
  setStoreBaseCurrency: (base: string) => void;
  rates: Record<string, number>;
  availableCurrencies: CurrencyInfo[];
  isLoadingRates: boolean;
  ratesError: string | null;
  formatPrice: (amount: number | string) => string;
  convertPrice: (amount: number | string) => ConvertedPrice;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  toggleModal: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

const CURRENCY_STORAGE_KEY = "cherrybrush_currency_pref";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCurrency, setSelectedCurrencyState] = useState<CurrencyInfo>(
    () => getCurrencyInfo(DEFAULT_CURRENCY_CODE)
  );
  const [storeBaseCurrency, setStoreBaseCurrency] = useState<string>("INR");
  // Rates start empty — no hardcoded rate numbers
  const [rates, setRates] = useState<Record<string, number>>({});
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(true);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Initialize selected currency from localStorage, or auto-detect from Vercel / Cloudflare geo headers
  useEffect(() => {
    try {
      const savedCode = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (savedCode) {
        setSelectedCurrencyState(getCurrencyInfo(savedCode));
        return;
      }

      // First-time visitor: detect location from Cloudflare / Vercel request headers
      fetch("/api/geo")
        .then((res) => res.json())
        .then((json) => {
          if (json?.success && json?.data?.currency) {
            setSelectedCurrencyState(getCurrencyInfo(json.data.currency));
          }
        })
        .catch((e) => console.warn("Geo auto-detect fallback:", e));
    } catch (e) {
      console.warn("Could not read currency preference from localStorage", e);
    }
  }, []);

  // Fetch exchange rates from /api/currency/rates (which pulls from DB cache or fresh provider)
  useEffect(() => {
    let isMounted = true;
    async function loadRates() {
      try {
        setIsLoadingRates(true);
        const res = await fetch("/api/currency/rates?base=USD");
        if (!res.ok) {
          throw new Error(`Currency API responded with status ${res.status}`);
        }
        const data = await res.json();
        if (data?.success && data?.data) {
          if (isMounted) {
            if (data.data.rates) {
              setRates(data.data.rates);
            }
            if (data.data.storeBaseCurrency) {
              setStoreBaseCurrency(data.data.storeBaseCurrency);
            }
            setRatesError(null);
          }
        }
      } catch (err: any) {
        console.error("Exchange rate fetch error:", err);
        if (isMounted) {
          setRatesError(err.message || "Failed to load exchange rates");
        }
      } finally {
        if (isMounted) {
          setIsLoadingRates(false);
        }
      }
    }

    loadRates();
    return () => {
      isMounted = false;
    };
  }, []);

  const setSelectedCurrency = useCallback((currency: CurrencyInfo) => {
    setSelectedCurrencyState(currency);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, currency.code);
    } catch (e) {
      console.warn("Could not save currency to localStorage", e);
    }
  }, []);

  const toggleModal = useCallback(() => {
    setIsModalOpen((prev) => !prev);
  }, []);

  // Dynamically populate available currencies directly from the rates returned by DB / API
  const availableCurrencies = useMemo(() => {
    const keys = Object.keys(rates);
    if (keys.length === 0) {
      // Common initial list while waiting for DB response
      return ["USD", "INR", "EUR", "GBP", "CAD", "AUD", "CHF"].map(getCurrencyInfo);
    }

    // Top currencies sorted first for convenient selection
    const priority = ["USD", "INR", "EUR", "GBP", "CAD", "AUD", "CHF", "AED", "SAR", "SGD", "JPY"];
    const prioritySet = new Set(priority);

    const sortedPriority = priority
      .filter((code) => keys.includes(code))
      .map(getCurrencyInfo);

    const remaining = keys
      .filter((code) => !prioritySet.has(code))
      .sort()
      .map(getCurrencyInfo);

    return [...sortedPriority, ...remaining];
  }, [rates]);

  /**
   * Converts catalog base price to selected currency based on dynamic storeBaseCurrency.
   * If rates are not available, falls back safely to original price without fake math.
   */
  const convertPrice = useCallback(
    (amount: number | string): ConvertedPrice => {
      const rawString = String(amount ?? "").trim();
      const numeric =
        typeof amount === "number"
          ? amount
          : parseFloat(rawString.replace(/[^0-9.]/g, "")) || 0;

      const baseRate =
        rates[storeBaseCurrency] || (storeBaseCurrency === "USD" ? 1 : rates["INR"] || 1);
      const targetRate = rates[selectedCurrency.code];

      // If rates have not loaded from DB/API, do not fake numbers — return original raw price
      if (!baseRate || !targetRate || numeric <= 0) {
        return {
          value: numeric,
          formatted: rawString || (numeric > 0 ? `${storeBaseCurrency} ${numeric}` : "0"),
          code: selectedCurrency.code,
        };
      }

      // Convert: Amount in storeBaseCurrency -> USD -> Target Currency
      const amountInUSD = numeric / baseRate;
      const convertedValue =
        selectedCurrency.code === storeBaseCurrency ? numeric : amountInUSD * targetRate;

      const isZeroDecimal = ["JPY", "KRW", "VND", "IDR", "CLP"].includes(
        selectedCurrency.code
      );
      const decimals =
        isZeroDecimal || selectedCurrency.code === "INR" ? 0 : 2;

      let formatted: string;
      try {
        formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: selectedCurrency.code,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(convertedValue);
      } catch {
        formatted = `${selectedCurrency.code} ${convertedValue.toFixed(decimals)}`;
      }

      return {
        value: Math.round(convertedValue * 100) / 100,
        formatted,
        code: selectedCurrency.code,
      };
    },
    [rates, selectedCurrency, storeBaseCurrency]
  );

  const formatPrice = useCallback(
    (amount: number | string): string => {
      return convertPrice(amount).formatted;
    },
    [convertPrice]
  );

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setSelectedCurrency,
        storeBaseCurrency,
        setStoreBaseCurrency,
        rates,
        availableCurrencies,
        isLoadingRates,
        ratesError,
        formatPrice,
        convertPrice,
        isModalOpen,
        setIsModalOpen,
        toggleModal,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
