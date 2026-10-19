import { connectDB } from "@/lib/db";
import StoreSettings from "@/lib/storeSettings.model";

const FALLBACK_DEFAULT_BASE = process.env.BASE_CURRENCY || "INR";

/**
 * Retrieves the store base currency from MongoDB.
 * Falls back to process.env.BASE_CURRENCY or "INR" if not configured.
 */
export async function getStoreBaseCurrency(): Promise<string> {
  try {
    await connectDB();
    const settings = await StoreSettings.findOne({ key: "general" });
    if (settings && settings.baseCurrency) {
      return settings.baseCurrency.toUpperCase();
    }
  } catch (error) {
    console.error("Failed to read store settings from DB:", error);
  }
  return FALLBACK_DEFAULT_BASE.toUpperCase();
}

/**
 * Updates the store base currency in MongoDB.
 */
export async function setStoreBaseCurrency(newBase: string): Promise<string> {
  await connectDB();
  const normalized = (newBase || "INR").trim().toUpperCase();

  const settings = await StoreSettings.findOneAndUpdate(
    { key: "general" },
    { $set: { baseCurrency: normalized, updatedAt: new Date() } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  return settings.baseCurrency;
}
