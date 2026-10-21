import { connectDB } from "@/lib/db";
import Coupon, { ICoupon, DiscountType } from "@/lib/coupon.model";
import Order from "@/lib/order.model";
import { getStoreBaseCurrency } from "@/lib/storeSettings";
import { getExchangeRates } from "@/lib/exchangeRates";

export interface CartItemForCoupon {
  productId: string;
  name?: string;
  price: number; // In order currency
  quantity: number;
}

export interface ValidateCouponInput {
  code: string;
  items: CartItemForCoupon[];
  subtotal: number; // Subtotal in order currency
  currency?: string; // Target currency code, e.g. "USD", "INR", "EUR"
  userId?: string;
  userEmail?: string;
}

export interface CouponEvaluationResult {
  isValid: boolean;
  error?: string;
  code?: string;
  description?: string;
  discountType?: DiscountType;
  discountValue?: number;
  discountAmount: number; // In order currency (rounded cleanly)
  isFreeShipping?: boolean;
  couponId?: string;
  referrerUserId?: string;
}

/**
 * Converts an amount from store base currency to target order currency.
 */
function convertCurrency(
  amount: number,
  baseCurrency: string,
  targetCurrency: string,
  rates: Record<string, number>
): number {
  if (baseCurrency === targetCurrency || amount <= 0) return amount;

  const baseRate = rates[baseCurrency] || (baseCurrency === "USD" ? 1 : rates["INR"] || 1);
  const targetRate = rates[targetCurrency];

  if (!baseRate || !targetRate) return amount;

  const amountInUSD = amount / baseRate;
  return amountInUSD * targetRate;
}

/**
 * Validates a coupon code against MongoDB rules, user eligibility,
 * product combos, and cart subtotal. Calculates the exact verified discount.
 */
export async function validateAndCalculateCoupon(
  input: ValidateCouponInput
): Promise<CouponEvaluationResult> {
  await connectDB();

  const cleanCode = (input.code || "").trim().toUpperCase();
  if (!cleanCode) {
    return { isValid: false, error: "Please enter a coupon code.", discountAmount: 0 };
  }

  // 1. Fetch Coupon from DB
  const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
  if (!coupon) {
    return {
      isValid: false,
      error: `Coupon "${cleanCode}" is invalid or has expired.`,
      discountAmount: 0,
    };
  }

  const now = new Date();

  // 2. Date Validity Check
  if (coupon.startDate && new Date(coupon.startDate) > now) {
    return {
      isValid: false,
      error: `Coupon "${cleanCode}" is not active yet.`,
      discountAmount: 0,
    };
  }

  if (coupon.endDate && new Date(coupon.endDate) < now) {
    return {
      isValid: false,
      error: `Coupon "${cleanCode}" has expired.`,
      discountAmount: 0,
    };
  }

  // 3. Global Usage Cap
  if (typeof coupon.maxUses === "number" && coupon.maxUses > 0) {
    if (coupon.usedCount >= coupon.maxUses) {
      return {
        isValid: false,
        error: `Coupon "${cleanCode}" has reached its maximum redemption limit.`,
        discountAmount: 0,
      };
    }
  }

  // 4. Specific Accounts / Referral Eligibility Check
  if (coupon.allowedUserIds && coupon.allowedUserIds.length > 0) {
    if (!input.userId || !coupon.allowedUserIds.includes(input.userId)) {
      return {
        isValid: false,
        error: `Coupon "${cleanCode}" is exclusive to select customer accounts.`,
        discountAmount: 0,
      };
    }
  }

  // 5. Per-User Usage Limit Check
  if (input.userId && coupon.maxUsesPerUser && coupon.maxUsesPerUser > 0) {
    const userPreviousUses = await Order.countDocuments({
      "customer.userId": input.userId,
      "pricing.couponCode": cleanCode,
      orderStatus: { $ne: "cancelled" },
    });

    if (userPreviousUses >= coupon.maxUsesPerUser) {
      return {
        isValid: false,
        error: `You have already used coupon "${cleanCode}".`,
        discountAmount: 0,
      };
    }
  }

  // Currency & Exchange Rate Resolution
  const storeBaseCurrency = await getStoreBaseCurrency();
  const targetCurrency = (input.currency || storeBaseCurrency).toUpperCase().trim();
  const exchangeRatesData = await getExchangeRates(storeBaseCurrency);
  const rates = exchangeRatesData?.rates || {};

  // 6. Minimum Cart Total Check
  if (typeof coupon.minCartTotal === "number" && coupon.minCartTotal > 0) {
    const convertedMinTotal = convertCurrency(
      coupon.minCartTotal,
      storeBaseCurrency,
      targetCurrency,
      rates
    );

    if (input.subtotal < convertedMinTotal) {
      const roundedMin = Math.round(convertedMinTotal);
      return {
        isValid: false,
        error: `Coupon "${cleanCode}" requires a minimum subtotal of ${targetCurrency} ${roundedMin}.`,
        discountAmount: 0,
      };
    }
  }

  // 7. Minimum Item Quantity Check
  const totalItemQuantity = (input.items || []).reduce(
    (acc, item) => acc + (item.quantity || 1),
    0
  );
  if (typeof coupon.minItemQuantity === "number" && coupon.minItemQuantity > 0) {
    if (totalItemQuantity < coupon.minItemQuantity) {
      return {
        isValid: false,
        error: `Coupon "${cleanCode}" requires at least ${coupon.minItemQuantity} item${
          coupon.minItemQuantity > 1 ? "s" : ""
        } in your bag.`,
        discountAmount: 0,
      };
    }
  }

  // 8. Specific Order Combos Check (requiredProductIds)
  if (coupon.requiredProductIds && coupon.requiredProductIds.length > 0) {
    const cartProductIds = new Set(
      (input.items || []).map((i) => String(i.productId))
    );
    const hasAllRequired = coupon.requiredProductIds.every((reqId) =>
      cartProductIds.has(String(reqId))
    );

    if (!hasAllRequired) {
      return {
        isValid: false,
        error: `Coupon "${cleanCode}" requires a specific combo of items in your bag.`,
        discountAmount: 0,
      };
    }
  }

  // 9. Specific Products Discount Calculation
  let rawDiscount = 0;
  const isFreeShipping = coupon.discountType === "free_shipping";

  if (coupon.applicableProductIds && coupon.applicableProductIds.length > 0) {
    // Discount applies ONLY to these matching products
    const applicableSet = new Set(
      coupon.applicableProductIds.map((id) => String(id))
    );
    const matchingItems = (input.items || []).filter((item) =>
      applicableSet.has(String(item.productId))
    );

    if (matchingItems.length === 0) {
      return {
        isValid: false,
        error: `Coupon "${cleanCode}" is only applicable to specific items not in your cart.`,
        discountAmount: 0,
      };
    }

    const applicableSubtotal = matchingItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    if (coupon.discountType === "percentage") {
      rawDiscount = applicableSubtotal * (coupon.discountValue / 100);

      // Apply optional cap converted to target currency
      if (typeof coupon.maxDiscountAmount === "number" && coupon.maxDiscountAmount > 0) {
        const convertedCap = convertCurrency(
          coupon.maxDiscountAmount,
          storeBaseCurrency,
          targetCurrency,
          rates
        );
        rawDiscount = Math.min(rawDiscount, convertedCap);
      }
    } else if (coupon.discountType === "fixed") {
      const convertedFixed = convertCurrency(
        coupon.discountValue,
        storeBaseCurrency,
        targetCurrency,
        rates
      );
      rawDiscount = Math.min(convertedFixed, applicableSubtotal);
    }
  } else {
    // General Cart Discount
    if (coupon.discountType === "percentage") {
      rawDiscount = input.subtotal * (coupon.discountValue / 100);

      if (typeof coupon.maxDiscountAmount === "number" && coupon.maxDiscountAmount > 0) {
        const convertedCap = convertCurrency(
          coupon.maxDiscountAmount,
          storeBaseCurrency,
          targetCurrency,
          rates
        );
        rawDiscount = Math.min(rawDiscount, convertedCap);
      }
    } else if (coupon.discountType === "fixed") {
      const convertedFixed = convertCurrency(
        coupon.discountValue,
        storeBaseCurrency,
        targetCurrency,
        rates
      );
      rawDiscount = Math.min(convertedFixed, input.subtotal);
    }
  }

  // 10. Clean Round Off: As requested, round off fractional cents like .08 or .60 cleanly
  const finalDiscountAmount = Math.max(0, Math.round(rawDiscount));

  return {
    isValid: true,
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount: finalDiscountAmount,
    isFreeShipping,
    couponId: String(coupon._id),
    referrerUserId: coupon.referrerUserId,
  };
}

/**
 * Increment coupon usage upon successful payment.
 */
export async function incrementCouponUsage(code: string): Promise<void> {
  try {
    await connectDB();
    const clean = (code || "").trim().toUpperCase();
    if (clean) {
      await Coupon.updateOne({ code: clean }, { $inc: { usedCount: 1 } });
    }
  } catch (err) {
    console.warn("Failed to increment coupon usage:", err);
  }
}
