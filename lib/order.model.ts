import mongoose, { Schema, Model, Document } from "mongoose";

export interface IOrderItemSnapshot {
  productId: string;
  name: string;
  slug?: string;
  image: string;
  price: number; // Unit price in store base currency at time of purchase
  quantity: number;
  subtotal: number; // price * quantity
  collectionName?: string;
  size?: string;
  shape?: string;
  length?: string;
  color?: string;
  shade?: string;
  style?: string;
}

export interface IShippingAddress {
  fullName: string;
  email: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface IPricingSnapshot {
  baseCurrency: string; // E.g., "INR" (store database currency)
  currency: string; // Currency charged, e.g. "USD", "EUR", "INR"
  exchangeRate: number; // Multiplier from baseCurrency to order currency (default: 1)
  itemsSubtotal: number; // In order currency
  shippingFee: number; // In order currency
  tax: number; // In order currency
  discount: number; // In order currency
  totalAmount: number; // Final payable amount in order currency
}

export interface IPaymentSnapshot {
  provider: "paypal" | "stripe" | "cod" | "manual";
  status: "pending" | "authorized" | "completed" | "failed" | "refunded";
  paypalOrderId?: string;
  paypalCaptureId?: string;
  paypalPayerId?: string;
  paypalPayerEmail?: string;
  paidAt?: Date;
  rawDetails?: Record<string, any>;
}

export interface IOrder extends Document {
  orderNumber: string;
  idempotencyKey?: string;
  items: IOrderItemSnapshot[];
  customer: {
    name: string;
    email: string;
    phone?: string;
    userId?: string;
  };
  shippingAddress: IShippingAddress;
  pricing: IPricingSnapshot;
  payment: IPaymentSnapshot;
  orderStatus:
    | "pending"
    | "processing"
    | "paid"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  customerNotes?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSnapshotSchema = new Schema<IOrderItemSnapshot>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
    collectionName: { type: String },
    size: { type: String, trim: true },
    shape: { type: String, trim: true },
    length: { type: String, trim: true },
    color: { type: String, trim: true },
    shade: { type: String, trim: true },
    style: { type: String, trim: true },
  },
  { _id: false, strict: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const PricingSnapshotSchema = new Schema<IPricingSnapshot>(
  {
    baseCurrency: { type: String, required: true, uppercase: true, default: "INR" },
    currency: { type: String, required: true, uppercase: true, default: "USD" },
    exchangeRate: { type: Number, required: true, default: 1 },
    itemsSubtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const PaymentSnapshotSchema = new Schema<IPaymentSnapshot>(
  {
    provider: {
      type: String,
      enum: ["paypal", "stripe", "cod", "manual"],
      default: "paypal",
    },
    status: {
      type: String,
      enum: ["pending", "authorized", "completed", "failed", "refunded"],
      default: "pending",
    },
    paypalOrderId: { type: String, index: true },
    paypalCaptureId: { type: String, index: true },
    paypalPayerId: { type: String },
    paypalPayerEmail: { type: String },
    paidAt: { type: Date },
    rawDetails: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
    items: {
      type: [OrderItemSnapshotSchema],
      required: [true, "Order must have at least one item"],
      validate: {
        validator: (v: IOrderItemSnapshot[]) => Array.isArray(v) && v.length > 0,
        message: "Order items cannot be empty",
      },
    },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true, index: true },
      phone: { type: String, trim: true },
      userId: { type: String, index: true },
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    pricing: {
      type: PricingSnapshotSchema,
      required: true,
    },
    payment: {
      type: PaymentSnapshotSchema,
      default: () => ({
        provider: "paypal",
        status: "pending",
      }),
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "paid",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
      index: true,
    },
    customerNotes: { type: String, trim: true },
    adminNotes: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

// Helper function to generate clean, collision-resistant order numbers
export function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `CB-${dateStr}-${randomSuffix}`;
}

// Ensure hot-reload updates the model schema if new fields were added
if (
  mongoose.models.Order &&
  (!mongoose.models.Order.schema.paths["items.length"] ||
    !mongoose.models.Order.schema.paths["items.shade"] ||
    !mongoose.models.Order.schema.paths.idempotencyKey)
) {
  delete (mongoose.models as any).Order;
}

// Next.js hot reload cache safety
const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
