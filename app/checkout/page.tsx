"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import {
  FiChevronLeft,
  FiChevronDown,
  FiSearch,
  FiPlus,
  FiMinus,
  FiCheck,
  FiShoppingBag,
  FiLock,
  FiX,
  FiUser,
} from "react-icons/fi";
import { getCloudinaryThumbnail } from "@/lib/imageLoader";
import {
  AsYouType,
  parsePhoneNumberFromString,
  getCountryCallingCode,
  isSupportedCountry,
  type CountryCode,
} from "libphonenumber-js";

// Official PayPal logotype SVG (monogram + wordmark)
function PayPalIcon({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 170 48"
      className={className}
      aria-label="PayPal"
    >
      <path
        fill="#003087"
        d="M62.56 28.672a10.111 10.111 0 009.983-8.56c.78-4.967-3.101-9.303-8.6-9.303H55.08a.689.689 0 00-.69.585l-3.95 25.072a.643.643 0 00.634.742h4.69a.689.689 0 00.688-.585l1.162-7.365a.689.689 0 01.689-.586h4.257zm3.925-8.786c-.29 1.836-1.709 3.189-4.425 3.189h-3.474l1.053-6.68h3.411c2.81.006 3.723 1.663 3.435 3.496v-.005zm26.378-1.18H88.41a.69.69 0 00-.69.585l-.144.924s-3.457-3.775-9.575-1.225c-3.51 1.461-5.194 4.48-5.91 6.69 0 0-2.277 6.718 2.87 10.417 0 0 4.771 3.556 10.145-.22l-.093.589a.642.642 0 00.634.742h4.451a.689.689 0 00.69-.585l2.708-17.175a.643.643 0 00-.634-.742zm-6.547 9.492a4.996 4.996 0 01-4.996 4.276 4.513 4.513 0 01-1.397-.205c-1.92-.616-3.015-2.462-2.7-4.462a4.996 4.996 0 015.014-4.277c.474-.005.946.065 1.398.206 1.913.614 3.001 2.46 2.686 4.462h-.005z"
      />
      <path
        fill="#0070E0"
        d="M126.672 28.672a10.115 10.115 0 009.992-8.56c.779-4.967-3.101-9.303-8.602-9.303h-8.86a.69.69 0 00-.689.585l-3.962 25.079a.637.637 0 00.365.683.64.64 0 00.269.06h4.691a.69.69 0 00.689-.586l1.163-7.365a.688.688 0 01.689-.586l4.255-.007zm3.925-8.786c-.29 1.836-1.709 3.189-4.426 3.189h-3.473l1.054-6.68h3.411c2.808.006 3.723 1.663 3.434 3.496v-.005zm26.377-1.18h-4.448a.69.69 0 00-.689.585l-.146.924s-3.456-3.775-9.574-1.225c-3.509 1.461-5.194 4.48-5.911 6.69 0 0-2.276 6.718 2.87 10.417 0 0 4.772 3.556 10.146-.22l-.093.589a.637.637 0 00.365.683c.084.04.176.06.269.06h4.451a.686.686 0 00.689-.586l2.709-17.175a.657.657 0 00-.148-.518.632.632 0 00-.49-.224zm-6.546 9.492a4.986 4.986 0 01-4.996 4.276 4.513 4.513 0 01-1.399-.205c-1.921-.616-3.017-2.462-2.702-4.462a4.996 4.996 0 014.996-4.277c.475-.005.947.064 1.399.206 1.933.614 3.024 2.46 2.707 4.462h-.005z"
      />
      <path
        fill="#003087"
        d="M109.205 19.131l-5.367 9.059-2.723-8.992a.69.69 0 00-.664-.492h-4.842a.516.516 0 00-.496.689l4.88 15.146-4.413 7.138a.517.517 0 00.442.794h5.217a.858.858 0 00.741-.418l13.632-22.552a.516.516 0 00-.446-.789h-5.215a.858.858 0 00-.746.417z"
      />
      <path
        fill="#0070E0"
        d="M161.982 11.387l-3.962 25.079a.637.637 0 00.365.683c.084.04.176.06.269.06h4.689a.688.688 0 00.689-.586l3.963-25.079a.637.637 0 00-.146-.517.645.645 0 00-.488-.225h-4.69a.69.69 0 00-.689.585z"
      />
      <path
        fill="#001C64"
        d="M37.146 22.26c-1.006 5.735-5.685 10.07-11.825 10.07h-3.898c-.795 0-1.596.736-1.723 1.55l-1.707 10.835c-.099.617-.388.822-1.013.822h-6.27c-.634 0-.784-.212-.689-.837l.72-7.493-7.526-.389c-.633 0-.862-.345-.772-.977l5.135-32.56c.099-.617.483-.882 1.106-.882h13.023c6.269 0 10.235 4.22 10.72 9.692 3.73 2.52 5.474 5.873 4.72 10.168z"
      />
      <path
        fill="#0070E0"
        d="M12.649 25.075l-1.907 12.133-1.206 7.612a1.034 1.034 0 001.016 1.19h6.622a1.27 1.27 0 001.253-1.072l1.743-11.06a1.27 1.27 0 011.253-1.071h3.898A12.46 12.46 0 0037.617 22.26c.675-4.307-1.492-8.228-5.201-10.165a9.96 9.96 0 01-.12 1.37 12.461 12.461 0 01-12.295 10.54h-6.1a1.268 1.268 0 00-1.252 1.07z"
      />
      <path
        fill="#003087"
        d="M10.741 37.208H3.03a1.035 1.035 0 01-1.018-1.192L7.208 3.072A1.268 1.268 0 018.46 2H21.7c6.269 0 10.827 4.562 10.72 10.089a11.567 11.567 0 00-5.399-1.287H15.983a1.27 1.27 0 00-1.254 1.071l-2.08 13.202-1.908 12.133z"
      />
    </svg>
  );
}

// Global international calling code mapping for country codes
const PHONE_CODES: Record<string, string> = {
  US: "+1",
  CA: "+1",
  GB: "+44",
  AU: "+61",
  IN: "+91",
  DE: "+49",
  FR: "+33",
  IT: "+39",
  ES: "+34",
  NL: "+31",
  AE: "+971",
  SG: "+65",
  JP: "+81",
  NZ: "+64",
  CH: "+41",
  SE: "+46",
  NO: "+47",
  DK: "+45",
  IE: "+353",
  BE: "+32",
  AT: "+43",
  PT: "+351",
  PL: "+48",
  CZ: "+420",
  GR: "+30",
  ZA: "+27",
  BR: "+55",
  MX: "+52",
  SA: "+966",
  KR: "+82",
  HK: "+852",
  MY: "+60",
  TH: "+66",
  PH: "+63",
  ID: "+62",
  VN: "+84",
  IL: "+972",
  TR: "+90",
  EG: "+20",
  NG: "+234",
  KE: "+254",
  PK: "+92",
  BD: "+880",
  LK: "+94",
  NP: "+977",
  QA: "+974",
  KW: "+965",
  BH: "+973",
  OM: "+968",
};

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    totalPrice,
    totalItems,
    shippingMethods,
    selectedShippingMethod,
    setSelectedShippingMethod,
    shippingFee,
    isLoadingShipping,
    setShippingCountry,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    couponError,
    setCouponError,
    isApplyingCoupon,
  } = useCart();
  const { formatPrice, selectedCurrency, availableCurrencies } = useCurrency();
  const { user, mongoUser, loading, openAuthModal } = useAuth();

  // Dynamic Country List derived from MongoDB-backed Currency Data
  const countries = useMemo(() => {
    const regionNames =
      typeof Intl !== "undefined" && Intl.DisplayNames
        ? new Intl.DisplayNames(["en"], { type: "region" })
        : null;

    const countryMap = new Map<string, string>();

    // Seed priority / popular countries first
    const priorityCodes = [
      "US",
      "GB",
      "CA",
      "AU",
      "IN",
      "DE",
      "FR",
      "IT",
      "ES",
      "NL",
      "AE",
      "SG",
      "JP",
    ];
    priorityCodes.forEach((code) => {
      const name = regionNames?.of(code) || code;
      countryMap.set(code, name);
    });

    // Populate and expand dynamically with all currencies stored in MongoDB
    (availableCurrencies || []).forEach((curr) => {
      const code = (curr.countryCode || curr.code.slice(0, 2)).toUpperCase();
      if (code === "EU") {
        const euroCountries = [
          "DE",
          "FR",
          "IT",
          "ES",
          "NL",
          "IE",
          "BE",
          "AT",
          "PT",
          "FI",
          "GR",
        ];
        euroCountries.forEach((c) => {
          const name = regionNames?.of(c) || c;
          if (!countryMap.has(c)) countryMap.set(c, name);
        });
        return;
      }

      try {
        const name = regionNames?.of(code) || code;
        if (!countryMap.has(code)) {
          countryMap.set(code, name);
        }
      } catch {
        if (!countryMap.has(code)) {
          countryMap.set(code, code);
        }
      }
    });

    const list = Array.from(countryMap.entries()).map(([code, name]) => ({
      code,
      name,
    }));

    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [availableCurrencies]);

  // Form states
  const [country, setCountry] = useState("US");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const countrySearchInputRef = useRef<HTMLInputElement>(null);

  // Close country dropdown on click outside or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCountryDropdownOpen(false);
        setCountrySearchQuery("");
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsCountryDropdownOpen(false);
        setCountrySearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Auto-focus search input when opening dropdown
  useEffect(() => {
    if (isCountryDropdownOpen) {
      setTimeout(() => {
        countrySearchInputRef.current?.focus();
      }, 50);
    }
  }, [isCountryDropdownOpen]);

  // Filter countries dynamically based on search query
  const filteredCountries = useMemo(() => {
    const q = countrySearchQuery.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [countries, countrySearchQuery]);

  const [phonePrefix, setPhonePrefix] = useState("+1");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [saveAddress, setSaveAddress] = useState(true);

  // Processing & resume states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resumedOrderNumber, setResumedOrderNumber] = useState<string | null>(
    null,
  );
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const pendingOrderSubmitRef = useRef(false);

  // Synchronous phone validity & E.164 normalization for form submission
  const phoneValidation = useMemo(() => {
    const trimmed = phone.trim();
    if (!trimmed) {
      return { isValid: false, e164: null };
    }

    const fullNumber = trimmed.startsWith("+")
      ? trimmed
      : `${phonePrefix} ${trimmed}`;

    const supported = isSupportedCountry(country)
      ? (country as CountryCode)
      : undefined;

    try {
      const parsed = parsePhoneNumberFromString(fullNumber, supported);
      return {
        isValid: parsed ? parsed.isValid() : false,
        e164: parsed && parsed.isValid() ? parsed.format("E.164") : null,
      };
    } catch {
      return { isValid: false, e164: null };
    }
  }, [phone, country, phonePrefix]);

  // 3-second debounce: only validate and show error after 3s of inactivity, show nothing while typing or when valid
  useEffect(() => {
    // Clear error immediately whenever user modifies phone, changes country, or while typing
    setPhoneError(null);

    const digits = phone.replace(/\D/g, "");
    if (!digits) {
      return;
    }

    const timer = setTimeout(() => {
      const fullNumber = phone.trim().startsWith("+")
        ? phone.trim()
        : `${phonePrefix} ${phone.trim()}`;

      const supported = isSupportedCountry(country)
        ? (country as CountryCode)
        : undefined;

      try {
        const parsed = parsePhoneNumberFromString(fullNumber, supported);
        const isValid = parsed ? parsed.isValid() : false;

        if (!isValid) {
          const countryName =
            countries.find((c) => c.code === country)?.name || country;
          setPhoneError(
            `Please enter a valid phone number for ${countryName}.`,
          );
        } else {
          setPhoneError(null);
        }
      } catch {
        setPhoneError("Please enter a valid phone number.");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [phone, country, phonePrefix, countries]);

  // Contextual placeholder based on country
  const phonePlaceholder = useMemo(() => {
    if (country === "US" || country === "CA") return "(555) 000-0000";
    if (country === "GB") return "7911 123456";
    if (country === "IN") return "98765 43210";
    if (country === "AU") return "412 345 678";
    if (country === "DE" || country === "FR") return "151 23456789";
    return "123 456 789";
  }, [country]);

  // Coupon input state (appliedCoupon & validation managed via CartContext)
  const [discountCode, setDiscountCode] = useState("");

  // Pre-fill fields for authenticated user
  useEffect(() => {
    if (user && !resumedOrderNumber) {
      if (!email && user.email) setEmail(user.email);
      if (!fullName && (user.displayName || mongoUser?.name)) {
        setFullName(user.displayName || mongoUser?.name || "");
      }
      if (!phone && (user.phoneNumber || mongoUser?.phone)) {
        let rawPhone = (user.phoneNumber || mongoUser?.phone || "").trim();
        if (rawPhone.startsWith(phonePrefix)) {
          rawPhone = rawPhone.slice(phonePrefix.length).trim();
        } else if (rawPhone.startsWith("+")) {
          for (const [cCode, pfx] of Object.entries(PHONE_CODES)) {
            if (rawPhone.startsWith(pfx)) {
              rawPhone = rawPhone.slice(pfx.length).trim();
              setCountry(cCode);
              setPhonePrefix(pfx);
              break;
            }
          }
        }
        setPhone(rawPhone);
      }
    }
  }, [user, mongoUser, phonePrefix, resumedOrderNumber]);

  // Auto-detect and sync initial country with detected currency
  useEffect(() => {
    if (selectedCurrency?.countryCode && !resumedOrderNumber) {
      const code = selectedCurrency.countryCode.toUpperCase();
      if (code !== "EU" && PHONE_CODES[code]) {
        setCountry(code);
        setShippingCountry(code);
        setPhonePrefix(PHONE_CODES[code]);
      }
    }
  }, [selectedCurrency, resumedOrderNumber]);

  // 1. Session Restoration: Check if an unfinished checkout exists in localStorage
  useEffect(() => {
    const savedOrderNumber = localStorage.getItem("active_order_number");
    if (!savedOrderNumber) return;

    fetch(`/api/orders/${savedOrderNumber}`)
      .then((res) => res.json())
      .then((data) => {
        // If order lookup fails or order does not exist, clean up invalid key
        if (!data.success || !data.order) {
          localStorage.removeItem("active_order_number");
          return;
        }

        const order = data.order;
        // If order is already completed/paid, clean up and redirect to checkout success
        if (data.resumeState?.isPaid) {
          localStorage.removeItem("active_order_number");
          router.push(`/checkout/success?orderNumber=${order.orderNumber}`);
          return;
        }

        // If order can be resumed, populate the shipping fields
        if (data.resumeState?.canResume && order.shippingAddress) {
          setResumedOrderNumber(order.orderNumber);
          setFullName(order.shippingAddress.fullName || "");
          setEmail(order.shippingAddress.email || "");

          // 1. Restore Country & Sync Phone Prefix correctly
          const restoredCountry = (
            order.shippingAddress.country || "US"
          ).toUpperCase();
          setCountry(restoredCountry);
          setShippingCountry(restoredCountry);
          let matchedPrefix = PHONE_CODES[restoredCountry] || "+1";
          setPhonePrefix(matchedPrefix);

          // 2. Strip embedded country code from restored phone so it doesn't double-display
          let localPhone = (order.shippingAddress.phone || "").trim();
          if (localPhone.startsWith(matchedPrefix)) {
            localPhone = localPhone.slice(matchedPrefix.length).trim();
          } else if (localPhone.startsWith("+")) {
            const parsed = parsePhoneNumberFromString(localPhone);
            if (parsed) {
              if (parsed.country) {
                setCountry(parsed.country);
                matchedPrefix = `+${parsed.countryCallingCode}`;
                setPhonePrefix(matchedPrefix);
              }
              localPhone = parsed.formatNational();
            }
          }
          const restoredFormatter = new AsYouType(
            isSupportedCountry(restoredCountry)
              ? (restoredCountry as CountryCode)
              : undefined,
          );
          setPhone(restoredFormatter.input(localPhone));

          setAddressLine1(order.shippingAddress.addressLine1 || "");
          setAddressLine2(order.shippingAddress.addressLine2 || "");
          setCity(order.shippingAddress.city || "");
          setStateProvince(order.shippingAddress.state || "");
          setPostalCode(order.shippingAddress.postalCode || "");

          // Auto-clean localStorage checkpoint now that checkout info is safely restored into state
          localStorage.removeItem("active_order_number");
        } else {
          // If order is cancelled or non-resumable, clean up stale checkpoint
          localStorage.removeItem("active_order_number");
        }
      })
      .catch((err) => {
        console.warn("Failed to restore checkout state:", err);
        // On network or unexpected parsing error, clean up to avoid repeating failures
        localStorage.removeItem("active_order_number");
      });
  }, [router]);

  // Unfreeze isSubmitting if restored via browser back/forward cache
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setIsSubmitting(false);
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  // Sync phone prefix when country selector changes
  const handleCountryChange = (selectedCountryCode: string) => {
    setCountry(selectedCountryCode);
    setShippingCountry(selectedCountryCode);
    if (isSupportedCountry(selectedCountryCode)) {
      try {
        const callingCode = getCountryCallingCode(
          selectedCountryCode as CountryCode,
        );
        setPhonePrefix(`+${callingCode}`);
      } catch {
        const prefix = PHONE_CODES[selectedCountryCode];
        if (prefix) setPhonePrefix(prefix);
      }
    } else if (PHONE_CODES[selectedCountryCode]) {
      setPhonePrefix(PHONE_CODES[selectedCountryCode]);
    }

    // Re-format existing digits with the new country's AsYouType formatter (capped at 14 digits)
    if (phone) {
      const digits = phone.replace(/\D/g, "").slice(0, 14);
      if (digits) {
        const supported = isSupportedCountry(selectedCountryCode)
          ? (selectedCountryCode as CountryCode)
          : undefined;
        const asYouType = new AsYouType(supported);
        setPhone(asYouType.input(digits));
      }
    }
  };

  // Handle Backspace / Delete over brackets, spaces, and formatting characters
  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const input = e.currentTarget;
      const { selectionStart, selectionEnd, value } = input;

      // Only handle single cursor position without text selection
      if (
        selectionStart !== null &&
        selectionStart === selectionEnd &&
        selectionStart > 0
      ) {
        const charBefore = value[selectionStart - 1];

        // If the character immediately to the left is non-digit (e.g. ')', '(', ' ', '-')
        if (/\D/.test(charBefore)) {
          e.preventDefault();

          // Find the index of the nearest preceding digit to delete
          let digitIndexToDelete = -1;
          for (let i = selectionStart - 1; i >= 0; i--) {
            if (/\d/.test(value[i])) {
              digitIndexToDelete = i;
              break;
            }
          }

          let newDigits = "";
          let digitsBeforeDeleted = 0;

          if (digitIndexToDelete !== -1) {
            digitsBeforeDeleted = value
              .slice(0, digitIndexToDelete)
              .replace(/\D/g, "").length;

            const before = value.slice(0, digitIndexToDelete);
            const after = value.slice(digitIndexToDelete + 1);
            newDigits = (before + after).replace(/\D/g, "").slice(0, 14);
          } else {
            // If deleting the opening parenthesis at start (before any digits), drop the first digit
            const allDigits = value.replace(/\D/g, "");
            newDigits = allDigits.slice(1, 14);
            digitsBeforeDeleted = 0;
          }

          if (!newDigits) {
            setPhone("");
            return;
          }

          const supportedCountry = isSupportedCountry(country)
            ? (country as CountryCode)
            : undefined;
          const formatter = new AsYouType(supportedCountry);
          const formatted = formatter.input(newDigits);
          setPhone(formatted);

          // Restore cursor to immediately after the remaining preceding digits
          requestAnimationFrame(() => {
            if (!input) return;
            let count = 0;
            let newCursorPos = 0;
            for (let i = 0; i < formatted.length; i++) {
              if (/\d/.test(formatted[i])) {
                count++;
              }
              if (count === digitsBeforeDeleted) {
                newCursorPos = i + 1;
                break;
              }
            }
            input.setSelectionRange(newCursorPos, newCursorPos);
          });
        }
      }
    }
  };

  // AsYouType formatting on user input (with max 14 digits restriction)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const input = e.target;
    // Dismiss error immediately while typing
    setPhoneError(null);

    if (!rawVal.trim()) {
      setPhone("");
      return;
    }

    // If user pasted or typed full international number starting with '+'
    if (rawVal.trim().startsWith("+")) {
      const parsed = parsePhoneNumberFromString(rawVal.trim());
      if (parsed) {
        if (parsed.country && parsed.country !== country) {
          setCountry(parsed.country);
          setPhonePrefix(`+${parsed.countryCallingCode}`);
        }
        const national = parsed.formatNational();
        const cappedDigits = national.replace(/\D/g, "").slice(0, 14);
        const supported = isSupportedCountry(parsed.country || country)
          ? ((parsed.country || country) as CountryCode)
          : undefined;
        setPhone(new AsYouType(supported).input(cappedDigits));
        return;
      }
    }

    // Strip country code if accidentally entered/pasted into the box
    let clean = rawVal;
    if (clean.trim().startsWith(phonePrefix)) {
      clean = clean.trim().slice(phonePrefix.length).trim();
    }

    const prevDigits = phone.replace(/\D/g, "");
    let newDigits = clean.replace(/\D/g, "");

    // Deletion detection (fallback for mobile virtual keyboards)
    if (
      clean.length < phone.length &&
      newDigits === prevDigits &&
      newDigits.length > 0
    ) {
      const cursorPos = input.selectionStart || 0;
      const digitsBeforeCursor = clean.slice(0, cursorPos).replace(/\D/g, "");
      const digitsAfterCursor = clean.slice(cursorPos).replace(/\D/g, "");
      newDigits = digitsBeforeCursor.slice(0, -1) + digitsAfterCursor;
    }

    // Restrict maximum number length to 14 digits
    newDigits = newDigits.slice(0, 14);

    if (!newDigits) {
      setPhone("");
      return;
    }

    // Format using Google's AsYouType formatter
    const supportedCountry = isSupportedCountry(country)
      ? (country as CountryCode)
      : undefined;
    const formatter = new AsYouType(supportedCountry);
    const formatted = formatter.input(newDigits);
    setPhone(formatted);
  };

  // Discount Calculation from Unified Coupon Engine
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;

  const effectiveShippingFee =
    items.length === 0 || appliedCoupon?.isFreeShipping
      ? 0
      : selectedShippingMethod
        ? selectedShippingMethod.isFree
          ? 0
          : selectedShippingMethod.price
        : shippingFee || 0;
  const estimatedTax = 0; // Free / included in price
  const finalTotal = Math.max(
    0,
    totalPrice - discountAmount + effectiveShippingFee + estimatedTax,
  );

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    const res = await applyCoupon(discountCode);
    if (res.success) {
      setDiscountCode("");
    }
  };

  const handleRemoveDiscount = () => {
    removeCoupon();
    setDiscountCode("");
  };

  // Form Validation Helper
  const validateForm = (silent = false): boolean => {
    if (!silent) setSubmitError(null);

    if (!fullName.trim()) {
      if (!silent) setSubmitError("Please enter your full name.");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      if (!silent) setSubmitError("Please enter a valid email address.");
      return false;
    }
    if (!phone.trim()) {
      if (!silent) setSubmitError("Please enter your phone number.");
      return false;
    }
    if (!phoneValidation.isValid) {
      const countryName =
        countries.find((c) => c.code === country)?.name || country;
      const errMsg = `Please enter a valid phone number for ${countryName}.`;
      if (!silent) {
        setPhoneError(errMsg);
        setSubmitError(errMsg);
      }
      return false;
    }
    if (!addressLine1.trim()) {
      if (!silent) setSubmitError("Please enter your street address.");
      return false;
    }
    if (!city.trim() || !postalCode.trim()) {
      if (!silent) setSubmitError("Please complete your city and postal code.");
      return false;
    }
    if (items.length === 0) {
      if (!silent) setSubmitError("Your shopping bag is empty.");
      return false;
    }

    return true;
  };

  // Execute Order Creation & Redirect to PayPal
  const executeCreateOrder = async (authenticatedUser?: any) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const activeUser = authenticatedUser || user;
      const targetUserId = mongoUser?.id || activeUser?.uid || undefined;

      const fullPhoneNumber =
        phoneValidation.e164 ||
        (phone.trim().startsWith("+")
          ? phone.trim()
          : `${phonePrefix} ${phone.trim()}`);

      const payload = {
        currency: selectedCurrency?.code || "USD",
        items: items.map((item: any) => ({
          productId: item.productId || item._id || item.id,
          name: item.name,
          quantity: item.quantity,
          size: item.size || item.selectedSize || item.nailSize,
          shape: item.shape || item.selectedShape,
          length: item.length || item.selectedLength || item.nailLength,
          color:
            item.shade ||
            item.color ||
            item.selectedShade ||
            item.selectedColor,
          shade:
            item.shade ||
            item.color ||
            item.selectedShade ||
            item.selectedColor,
          style: item.style,
        })),
        customer: {
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: fullPhoneNumber,
          userId: targetUserId,
        },
        shippingAddress: {
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: fullPhoneNumber,
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || undefined,
          city: city.trim(),
          state: stateProvince.trim() || undefined,
          postalCode: postalCode.trim(),
          country: country,
        },
        shippingFee: effectiveShippingFee,
        discount: discountAmount,
        couponCode: appliedCoupon?.code || undefined,
        returnUrl: `${window.location.origin}/checkout/success`,
        cancelUrl: `${window.location.origin}/checkout`,
      };

      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to initialize PayPal payment.");
      }

      // Save order checkpoint for session restoration if user navigates back
      if (data.orderNumber) {
        localStorage.setItem("active_order_number", data.orderNumber);
      }

      // Redirect to PayPal approval screen
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        throw new Error("PayPal approval link not received. Please try again.");
      }
    } catch (err: any) {
      console.error("Payment initiation error:", err);
      setSubmitError(
        err.message || "An unexpected error occurred. Please try again.",
      );
      setIsSubmitting(false);
    }
  };

  // Submit Handler: If guest, pop sign in screen directly on click WITHOUT validating form inputs;
  // if authenticated, validate form inputs and proceed to PayPal
  const handlePayWithPayPal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      pendingOrderSubmitRef.current = true;
      openAuthModal("signup");
      return;
    }

    if (!validateForm()) {
      return;
    }

    await executeCreateOrder(user);
  };

  // Seamless Auto-Submit: When guest authenticates after clicking "Sign in to Order",
  // if all details are already filled, immediately forward to PayPal; otherwise let them finish filling
  useEffect(() => {
    if (user && pendingOrderSubmitRef.current) {
      pendingOrderSubmitRef.current = false;
      if (validateForm(true)) {
        executeCreateOrder(user);
      }
    }
  }, [user, mongoUser]);

  // Loading State while verifying authentication session
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] text-[#111827] font-sans antialiased flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-gray-300 border-t-black rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-600">
          Verifying checkout session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#111827] font-sans antialiased pb-20">
      {/* ── 1. Top Checkout Header (With bottom border & Logo on the right) ── */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Back to Cart Button */}
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-black transition-colors"
          >
            <FiChevronLeft className="w-4 h-4 text-gray-500" />
            <span>Back to Cart</span>
          </Link>

          {/* Right: Brand Logo (Without text name, just the logo) */}
          <Link
            href="/"
            className="flex items-center justify-center"
            aria-label="Cherrybrush Home"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-xs border border-gray-100 transition-transform hover:scale-105">
              <Image
                src="/logo.jpeg"
                alt="Cherrybrush Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </Link>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Resumed Order Banner */}
        {/* {resumedOrderNumber && (
            <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
                <span>
                  Restored previous checkout details for order{" "}
                  <strong>#{resumedOrderNumber}</strong>.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFullName("");
                    setEmail("");
                    setPhone("");
                    setAddressLine1("");
                    setAddressLine2("");
                    setCity("");
                    setStateProvince("");
                    setPostalCode("");
                    setResumedOrderNumber(null);
                  }}
                  className="text-xs font-semibold text-blue-700 underline hover:text-blue-900 cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setResumedOrderNumber(null)}
                  className="text-blue-500 hover:text-blue-800 p-1 rounded-md transition-colors cursor-pointer"
                  aria-label="Dismiss restored banner"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
          )} */}

        {items.length === 0 ? (
          /* Empty Bag State */
          <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
              <FiShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Looks like you haven&apos;t added any luxury press-on nail sets to
              your cart yet.
            </p>
            <Link
              href="/collection"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handlePayWithPayPal}
            noValidate
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* ── Left Column: Shipping Information & Shipping Card (7 cols) ── */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Shipping Information */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/90 shadow-xs">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-5">
                  Shipping Information
                </h2>

                <div className="space-y-[24px] tracking-wide">
                  {/* Country / Region on Top (Custom shadcn-style dropdown) */}
                  <div ref={countryDropdownRef} className="relative">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Country / Region <span className="text-black">*</span>
                    </label>

                    {/* Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen((prev) => !prev)}
                      aria-haspopup="listbox"
                      aria-expanded={isCountryDropdownOpen}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border bg-white text-[14px] text-gray-900 transition-all cursor-pointer ${
                        isCountryDropdownOpen
                          ? "border-black ring-1 ring-black shadow-xs"
                          : "border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      }`}
                    >
                      <span className="truncate font-medium text-gray-900">
                        {countries.find((c) => c.code === country)?.name ||
                          "Select a country..."}
                      </span>
                      <FiChevronDown
                        className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${
                          isCountryDropdownOpen ? "rotate-180 text-black" : ""
                        }`}
                      />
                    </button>

                    {/* shadcn Popover Menu */}
                    {isCountryDropdownOpen && (
                      <div
                        role="listbox"
                        className="absolute left-0 top-full mt-1.5 z-50 w-full min-w-[260px] rounded-xl border border-gray-200 bg-white p-1.5 text-gray-900 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95"
                      >
                        {/* Search Filter Header */}
                        <div className="flex items-center px-2.5 py-1.5 border-b border-gray-100 gap-2 mb-1">
                          <FiSearch className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <input
                            ref={countrySearchInputRef}
                            type="text"
                            placeholder="Search country..."
                            value={countrySearchQuery}
                            onChange={(e) =>
                              setCountrySearchQuery(e.target.value)
                            }
                            className="w-full bg-transparent text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                          {countrySearchQuery && (
                            <button
                              type="button"
                              onClick={() => setCountrySearchQuery("")}
                              className="text-[11px] text-gray-400 hover:text-black font-medium"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {/* Country Options List */}
                        <div className="max-h-56 overflow-y-auto overscroll-contain py-0.5 space-y-0.5">
                          {filteredCountries.length === 0 ? (
                            <div className="py-4 text-center text-xs text-gray-400">
                              No country found.
                            </div>
                          ) : (
                            filteredCountries.map((c) => {
                              const isSelected = c.code === country;
                              return (
                                <button
                                  key={c.code}
                                  type="button"
                                  role="option"
                                  aria-selected={isSelected}
                                  onClick={() => {
                                    handleCountryChange(c.code);
                                    setIsCountryDropdownOpen(false);
                                    setCountrySearchQuery("");
                                  }}
                                  className={`relative flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[13px] sm:text-[14px] text-left transition-colors cursor-pointer select-none ${
                                    isSelected
                                      ? "bg-gray-100 font-semibold text-gray-900"
                                      : "font-normal text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                  }`}
                                >
                                  <span className="truncate">{c.name}</span>
                                  {isSelected && (
                                    <FiCheck className="w-4 h-4 text-black shrink-0 ml-2" />
                                  )}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Full Name <span className="text-black">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Anderson"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                      required
                    />
                  </div>

                  {/* Email & Phone Number (Two Columns) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Email Address <span className="text-black">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="john@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-black">*</span>
                      </label>
                      <div
                        className={`flex rounded-xl border bg-white overflow-hidden transition-all ${
                          phoneError
                            ? "border-red-400 focus-within:ring-2 focus-within:ring-red-400/20 focus-within:border-red-500"
                            : "border-gray-300 focus-within:ring-2 focus-within:ring-black focus-within:border-black"
                        }`}
                      >
                        <span className="inline-flex items-center px-3 py-2 bg-gray-50 border-r border-gray-200 text-[14px] font-medium text-gray-600 select-none">
                          {phonePrefix}
                        </span>
                        <input
                          type="tel"
                          placeholder={phonePlaceholder}
                          value={phone}
                          onChange={handlePhoneChange}
                          onKeyDown={handlePhoneKeyDown}
                          maxLength={20}
                          className="w-full px-3 py-2 bg-white text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
                          required
                        />
                      </div>
                      {phoneError && (
                        <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1 animate-in fade-in">
                          {phoneError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Apartment, Suite, etc. (Optional) */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Apartment, suite, unit (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Apartment, suite, unit etc"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                    />
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Address <span className="text-black">*</span>
                    </label>
                    <textarea
                      placeholder="Street Name, Apartment, or Landmark"
                      value={addressLine1}
                      rows={3}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                      required
                    />
                  </div>

                  {/* City, State / Province, Postal Code (3 columns) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        City <span className="text-black">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="New York"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        State / Province <span className="text-black">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="NY"
                        value={stateProvince}
                        onChange={(e) => setStateProvince(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Postal Code <span className="text-black">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="12345"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Save address checkbox */}
                  <div className="pt-2 flex items-center gap-2.5">
                    <input
                      id="save-address"
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="w-4 h-4 rounded text-black border-gray-300 focus:ring-black focus:ring-offset-0 cursor-pointer"
                    />
                    <label
                      htmlFor="save-address"
                      className="text-xs text-gray-600 select-none cursor-pointer"
                    >
                      Save this address for future purchases
                    </label>
                  </div>
                </div>
              </div>

              {/* Card 2: Shipping Method Card (Dynamic from MongoDB) */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    Shipping Method
                  </h2>
                  {isLoadingShipping && (
                    <span className="text-xs text-gray-400 animate-pulse">
                      Updating shipping rates...
                    </span>
                  )}
                </div>

                {shippingMethods.length === 0 ? (
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 text-xs text-gray-500">
                    Standard shipping applies for your selected destination.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shippingMethods.map((method) => {
                      const isSelected =
                        selectedShippingMethod?.id === method.id;
                      const methodCost =
                        method.isFree || appliedCoupon?.isFreeShipping
                          ? 0
                          : method.price;

                      return (
                        <div
                          key={method.id}
                          onClick={() => setSelectedShippingMethod(method)}
                          className={`relative flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-black bg-gray-50/70 shadow-xs"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            {/* Active Radio Dot */}
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? "border-black" : "border-gray-300"
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-black" />
                              )}
                            </div>

                            <div>
                              <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <span>{method.name}</span>
                                {method.carrier && (
                                  <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">
                                    {method.carrier}
                                  </span>
                                )}
                              </div>
                              {method.estimatedDelivery?.label && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  Delivered in {method.estimatedDelivery.label}
                                </div>
                              )}
                              {method.description && (
                                <div className="text-[11px] text-gray-400 mt-0.5">
                                  {method.description}
                                </div>
                              )}
                            </div>
                          </div>

                          <div
                            className={`text-sm font-bold ${
                              methodCost === 0
                                ? "text-emerald-700"
                                : "text-gray-900"
                            }`}
                          >
                            {methodCost === 0
                              ? "FREE"
                              : formatPrice(methodCost)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <p className="text-[11px] text-gray-400 mt-3.5">
                  Delivery time and tracking are provided upon dispatch.
                </p>
              </div>

              {/* Error Alert if any */}
              {submitError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm">
                  {submitError}
                </div>
              )}
            </div>

            {/* ── Right Column: Order Summary (5 cols) ── */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/90 shadow-xs sticky top-24">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-5">
                  Order Summary
                </h2>

                {/* Products Inset Gray Box */}
                <div className="bg-[#f9fafb] border border-gray-100 rounded-2xl p-4 divide-y divide-gray-100 max-h-72 overflow-y-auto">
                  {items.map((item) => {
                    const thumbUrl = item.image
                      ? getCloudinaryThumbnail(item.image, 120, 120)
                      : "/sample.webp";
                    const variantDetails = [
                      item.size,
                      item.shape,
                      item.length,
                      item.shade || item.color,
                    ]
                      .filter(Boolean)
                      .join(" · ");

                    return (
                      <div
                        key={item.id}
                        className="py-3 first:pt-0 last:pb-0 flex items-center gap-3.5"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-20 h-20 rounded-xl bg-white border border-gray-200/80 overflow-hidden shrink-0">
                          <Image
                            src={thumbUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Title & Variants */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                            {item.name}
                          </h3>
                          {variantDetails && (
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">
                              {variantDetails}
                            </p>
                          )}

                          {/* Quantity Pill (+ / -) */}
                          {/* <div className="inline-flex items-center gap-2 mt-1.5 px-2 py-0.5 rounded-md border border-gray-200 bg-white text-xs">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  Math.max(1, item.quantity - 1),
                                )
                              }
                              className="text-gray-500 hover:text-black transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <FiMinus className="w-3 h-3" />
                            </button>
                            <span className="font-semibold text-gray-900 text-xs">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="text-gray-500 hover:text-black transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <FiPlus className="w-3 h-3" />
                            </button>
                          </div> */}
                          <div className="inline-flex items-center gap-2">
                            <div className="font-semibold text-xs">
                              {formatPrice(item.price)}
                            </div>
                            <div className="text-xs text-gray-400">x</div>
                            <div className="font-semibold text-xs text-gray-400">
                              {item.quantity}
                            </div>
                          </div>
                        </div>

                        {/* Line Price */}
                        <div className="text-right text-xs sm:text-sm font-semibold text-gray-900 shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── 5. Discount Code Input & Apply Button (After products, before subtotal) ── */}
                <div className="mt-5 pt-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Discount code"
                      value={discountCode}
                      onChange={(e) => {
                        setDiscountCode(e.target.value);
                        if (couponError) setCouponError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyDiscount();
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-300 bg-white text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={handleApplyDiscount}
                      disabled={isApplyingCoupon}
                      className="px-4 py-2 rounded-xl bg-black hover:bg-gray-800 text-white text-[14px] font-semibold tracking-wide transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {isApplyingCoupon ? "Applying..." : "Apply"}
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-[11px] text-red-500 mt-1.5">
                      {couponError}
                    </p>
                  )}

                  {appliedCoupon && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                      <FiCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {appliedCoupon.code} applied (
                        {appliedCoupon.discountType === "percentage"
                          ? `${appliedCoupon.discountValue}% OFF`
                          : appliedCoupon.discountType === "free_shipping"
                            ? "FREE SHIPPING"
                            : `-${formatPrice(appliedCoupon.discountAmount)}`}
                        )
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveDiscount}
                        className="ml-1 text-emerald-600 hover:text-emerald-900 cursor-pointer"
                        aria-label="Remove coupon"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Subtotal & Breakdown */}
                <div className="mt-6 pt-5 border-t border-gray-100 space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 font-medium">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-gray-600">
                    <span>
                      Shipping
                      {selectedShippingMethod
                        ? ` (${selectedShippingMethod.name})`
                        : ""}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {effectiveShippingFee === 0
                        ? "FREE"
                        : formatPrice(effectiveShippingFee)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="font-medium text-gray-900">$0.00</span>
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-xl font-extrabold text-gray-900">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* ── 4. Primary CTA: "Pay with [PayPal Logo] - Total" OR "Sign in to Order · Total" ── */}
                <div className="mt-6">
                  {submitError && (
                    <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                      <span className="font-semibold text-sm leading-none">
                        ⚠️
                      </span>
                      <span className="leading-snug">{submitError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-xl bg-[#0a0a0a] hover:bg-[#1a1a1a] active:scale-[0.99] text-white text-sm sm:text-base font-semibold shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Connecting to PayPal...</span>
                      </div>
                    ) : !user ? (
                      <div className="flex items-center justify-center gap-2">
                        <span>Sign in to Order</span>
                        <span>·</span>
                        <span>{formatPrice(finalTotal)}</span>
                      </div>
                    ) : (
                      <>
                        <span>Pay with</span>
                        <div className="bg-white rounded-xs px-2.5 py-1 mb-1 flex items-center shadow-2xs">
                          <PayPalIcon className="h-4 sm:h-4.5 w-auto" />
                        </div>
                        <span>· {formatPrice(finalTotal)}</span>
                      </>
                    )}
                  </button>

                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-500 text-center">
                    {!user ? (
                      <span>
                        We&apos;ll save your order to your account and take you
                        straight to payment.
                      </span>
                    ) : (
                      <>
                        <FiLock className="w-3 h-3 text-gray-400" />
                        <span>
                          Guaranteed safe and encrypted through PayPal
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
