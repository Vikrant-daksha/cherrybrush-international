import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Product from "@/lib/product.model";
import Order, {
  IOrder,
  IOrderItemSnapshot,
  IShippingAddress,
  generateOrderNumber,
} from "@/lib/order.model";
import { getStoreBaseCurrency } from "@/lib/storeSettings";
import { getExchangeRates } from "@/lib/exchangeRates";

export interface CreateOrderInputItem {
  productId: string;
  name?: string;
  quantity: number;
  size?: string;
  shape?: string;
  length?: string;
  color?: string;
  shade?: string;
  style?: string;
}

export interface CreateOrderInput {
  items: CreateOrderInputItem[];
  customer: {
    name: string;
    email: string;
    phone?: string;
    userId?: string;
  };
  shippingAddress: IShippingAddress;
  currency?: string;
  shippingFee?: number;
  tax?: number;
  discount?: number;
  idempotencyKey?: string;
  customerNotes?: string;
}

/**
 * Validates cart items against actual MongoDB records, computes secure prices,
 * and creates an immutable Order Snapshot in MongoDB.
 */
export async function createOrderSnapshot(input: CreateOrderInput): Promise<IOrder> {
  await connectDB();

  // If an idempotencyKey is supplied, check if this exact order was already created
  if (input.idempotencyKey) {
    const existingOrder = await Order.findOne({ idempotencyKey: input.idempotencyKey });
    if (existingOrder) {
      return existingOrder;
    }
  }

  if (!input.items || input.items.length === 0) {
    throw new Error("Order must contain at least one item.");
  }

  // 1. Fetch store base currency and current exchange rates
  const storeBaseCurrency = await getStoreBaseCurrency();
  const targetCurrency = (input.currency || storeBaseCurrency).toUpperCase().trim();

  let exchangeRate = 1;
  if (targetCurrency !== storeBaseCurrency) {
    try {
      const rateData = await getExchangeRates(storeBaseCurrency);
      exchangeRate = rateData.rates[targetCurrency] || 1;
    } catch (e) {
      console.warn("Could not fetch latest exchange rate, defaulting to 1:1:", e);
      exchangeRate = 1;
    }
  }

  // 2. Query all requested products from MongoDB safely without triggering CastError
  const validObjectIds: mongoose.Types.ObjectId[] = [];
  const stringIdentifiers: string[] = [];

  for (const item of input.items) {
    const rawId = String(item.productId || "").trim();
    if (mongoose.Types.ObjectId.isValid(rawId) && rawId.length === 24) {
      validObjectIds.push(new mongoose.Types.ObjectId(rawId));
    } else if (rawId) {
      stringIdentifiers.push(rawId);
    }

    if (item.name && typeof item.name === "string") {
      stringIdentifiers.push(item.name.trim());
    }
  }

  const queryConditions: any[] = [];
  if (validObjectIds.length > 0) {
    queryConditions.push({ _id: { $in: validObjectIds } });
  }
  if (stringIdentifiers.length > 0) {
    const uniqueStrings = Array.from(new Set(stringIdentifiers));
    queryConditions.push({ name: { $in: uniqueStrings } });
    queryConditions.push({ slug: { $in: uniqueStrings.map((s) => s.toLowerCase()) } });
  }

  const productsFromDb = queryConditions.length > 0
    ? await Product.find({ $or: queryConditions }).lean()
    : [];

  const productMap = new Map<string, any>();
  productsFromDb.forEach((p: any) => {
    productMap.set(p._id.toString(), p);
    if (p.slug) productMap.set(p.slug.toLowerCase(), p);
    if (p.name) {
      productMap.set(p.name, p);
      productMap.set(p.name.toLowerCase().trim(), p);
    }
  });

  // 3. Build verified item snapshots strictly from MongoDB data
  const itemSnapshots: IOrderItemSnapshot[] = [];
  let baseSubtotal = 0;

  for (const item of input.items) {
    const rawId = String(item.productId || "").trim();
    const itemName = String(item.name || "").trim();

    const dbProduct =
      productMap.get(rawId) ||
      productMap.get(rawId.toLowerCase()) ||
      (itemName ? productMap.get(itemName) : null) ||
      (itemName ? productMap.get(itemName.toLowerCase()) : null);

    if (!dbProduct) {
      throw new Error(`Product "${itemName || rawId}" was not found in the database.`);
    }

    if (dbProduct.inStock === false) {
      throw new Error(`Product "${dbProduct.name}" is currently out of stock.`);
    }

    const qty = Math.max(1, Math.floor(item.quantity || 1));
    const unitPriceBase = Number(dbProduct.price);
    const lineSubtotalBase = unitPriceBase * qty;

    baseSubtotal += lineSubtotalBase;

    // Robust variant extraction (handles item.length, item.shade, and catalog defaults)
    const rawShape =
      item.shape ||
      (item as any).selectedShape ||
      (dbProduct.shapes && dbProduct.shapes.length > 0
        ? typeof dbProduct.shapes[0] === "string"
          ? dbProduct.shapes[0]
          : dbProduct.shapes[0].name || dbProduct.shapes[0].id
        : undefined);

    const rawLength =
      item.length ||
      (item as any).selectedLength ||
      (item as any).nailLength ||
      (dbProduct.lengths && dbProduct.lengths.length > 0
        ? typeof dbProduct.lengths[0] === "string"
          ? dbProduct.lengths[0]
          : (dbProduct.lengths[0] as any).name || (dbProduct.lengths[0] as any).label || (dbProduct.lengths[0] as any).value
        : undefined);

    const rawSize =
      item.size ||
      (item as any).selectedSize ||
      (item as any).nailSize ||
      (dbProduct.sizes && dbProduct.sizes.length > 0
        ? typeof dbProduct.sizes[0] === "string"
          ? dbProduct.sizes[0]
          : (dbProduct.sizes[0] as any).name || (dbProduct.sizes[0] as any).label
        : undefined);

    const rawShade =
      item.shade ||
      item.color ||
      (item as any).selectedShade ||
      (item as any).selectedColor ||
      (dbProduct.colors && dbProduct.colors.length > 0
        ? dbProduct.colors[0].label || dbProduct.colors[0].name || dbProduct.colors[0].hex
        : undefined);

    itemSnapshots.push({
      productId: dbProduct._id.toString(),
      name: dbProduct.name,
      slug: dbProduct.slug,
      image: dbProduct.images?.[0] || "",
      price: unitPriceBase,
      quantity: qty,
      subtotal: lineSubtotalBase,
      collectionName: dbProduct.collection,
      size: rawSize ? String(rawSize).trim() : undefined,
      shape: rawShape ? String(rawShape).trim() : undefined,
      length: rawLength ? String(rawLength).trim() : undefined,
      color: rawShade ? String(rawShade).trim() : undefined,
      shade: rawShade ? String(rawShade).trim() : undefined,
      style: item.style || dbProduct.style,
    });
  }

  // 4. Compute amounts in order currency
  const itemsSubtotalInCurrency = Number((baseSubtotal * exchangeRate).toFixed(2));
  const shippingFee = Number((input.shippingFee || 0).toFixed(2));
  const tax = Number((input.tax || 0).toFixed(2));
  const discount = Number((input.discount || 0).toFixed(2));

  const totalAmount = Number(
    Math.max(0, itemsSubtotalInCurrency + shippingFee + tax - discount).toFixed(2)
  );

  // 5. Generate human-readable order number and persist the snapshot
  const orderNumber = generateOrderNumber();

  const orderDoc = new Order({
    orderNumber,
    idempotencyKey: input.idempotencyKey,
    items: itemSnapshots,
    customer: {
      name: input.customer.name.trim(),
      email: input.customer.email.trim().toLowerCase(),
      phone: input.customer.phone?.trim(),
      userId: input.customer.userId,
    },
    shippingAddress: {
      fullName: input.shippingAddress.fullName.trim(),
      email: input.shippingAddress.email.trim().toLowerCase(),
      phone: input.shippingAddress.phone?.trim(),
      addressLine1: input.shippingAddress.addressLine1.trim(),
      addressLine2: input.shippingAddress.addressLine2?.trim(),
      city: input.shippingAddress.city.trim(),
      state: input.shippingAddress.state?.trim(),
      postalCode: input.shippingAddress.postalCode.trim(),
      country: input.shippingAddress.country.trim().toUpperCase(),
    },
    pricing: {
      baseCurrency: storeBaseCurrency,
      currency: targetCurrency,
      exchangeRate,
      itemsSubtotal: itemsSubtotalInCurrency,
      shippingFee,
      tax,
      discount,
      totalAmount,
    },
    payment: {
      provider: "paypal",
      status: "pending",
    },
    orderStatus: "pending",
    customerNotes: input.customerNotes,
  });

  await orderDoc.save();
  return orderDoc;
}
