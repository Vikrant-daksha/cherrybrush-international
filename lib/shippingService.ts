import { connectDB } from "@/lib/db";
import ShippingMethod, { IShippingMethod } from "@/lib/shipping.model";
import { getStoreBaseCurrency } from "@/lib/storeSettings";

export interface FormattedShippingOption {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  isFree: boolean;
  estimatedDelivery: {
    min: number;
    max: number;
    unit: string;
    label: string;
  };
  carrier: string;
  isDefault: boolean;
}

/**
 * Default presets removed — shipping methods are loaded dynamically from the MongoDB database.
 */
export async function seedDefaultShippingMethods(): Promise<void> {
  // No-op: Static presets removed; shipping methods are configured directly in MongoDB.
}

/**
 * Retrieves eligible active shipping options from the database for a given country and subtotal.
 */
export async function getEligibleShippingMethods(
  countryCode: string = "ALL",
  subtotal: number = 0,
): Promise<FormattedShippingOption[]> {
  await connectDB();

  const normalizedCountry = (countryCode || "").trim().toUpperCase();

  // Find all active shipping methods
  const methods = await ShippingMethod.find({ isActive: true })
    .sort({ sortOrder: 1, price: 1 })
    .lean<IShippingMethod[]>();

  const filtered = methods.filter((m) => {
    // If no country specified or ALL, include all active methods
    if (!normalizedCountry || normalizedCountry === "ALL") return true;

    // If region applies to all countries
    if (m.regions.type === "all") return true;

    // Domestic check
    if (m.regions.type === "domestic" && normalizedCountry === "IN")
      return true;

    // International check
    if (m.regions.type === "international" && normalizedCountry !== "IN")
      return true;

    // Custom country list check
    if (
      m.regions.type === "custom" &&
      Array.isArray(m.regions.countries) &&
      m.regions.countries.includes(normalizedCountry)
    ) {
      return true;
    }

    return false;
  });

  return filtered.map((m) => {
    // Check if customer order qualifies for free shipping threshold
    const qualifiesForFree =
      typeof m.freeShippingThreshold === "number" &&
      m.freeShippingThreshold > 0 &&
      subtotal >= m.freeShippingThreshold;

    const finalPrice = qualifiesForFree ? 0 : m.price;

    return {
      id: (m as any)._id.toString(),
      name: m.name,
      slug: m.slug,
      description: m.description || "",
      price: finalPrice,
      currency: m.currency,
      isFree: finalPrice === 0,
      estimatedDelivery: {
        min: m.estimatedDays.min,
        max: m.estimatedDays.max,
        unit: m.estimatedDays.unit,
        label:
          m.estimatedDays.label ||
          `${m.estimatedDays.min}–${m.estimatedDays.max} Days`,
      },
      carrier: m.carrier || "",
      isDefault: m.isDefault,
    };
  });
}
