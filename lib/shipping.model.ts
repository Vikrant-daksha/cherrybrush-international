import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEstimatedDelivery {
  min: number; // Minimum days, e.g. 3
  max: number; // Maximum days, e.g. 5
  unit: "days" | "business_days" | "hours"; // Delivery time unit
  label?: string; // Display label, e.g. "3–5 Business Days"
}

export interface IShippingRegions {
  type: "all" | "domestic" | "international" | "custom";
  countries: string[]; // ISO-2 Country Codes, e.g. ["US", "CA", "IN"]
}

export interface IShippingMethod extends Document {
  name: string; // E.g., "Standard Ground", "Express Air"
  slug: string; // URL-safe unique identifier
  description?: string; // E.g., "Tracked delivery to your doorstep"
  price: number; // Shipping cost in store base currency (e.g., INR or USD)
  currency: string; // Currency code, default "INR"
  estimatedDays: IEstimatedDelivery;
  freeShippingThreshold?: number | null; // Order subtotal at which shipping becomes free
  regions: IShippingRegions;
  carrier?: string; // E.g., "FedEx", "DHL", "BlueDart", "USPS"
  isActive: boolean; // Toggle option availability
  isDefault: boolean; // Pre-selected shipping option at checkout
  sortOrder: number; // Order index for display (lower appears first)
  createdAt: Date;
  updatedAt: Date;
}

const EstimatedDeliverySchema = new Schema<IEstimatedDelivery>(
  {
    min: {
      type: Number,
      required: [true, "Minimum delivery time is required"],
      min: [0, "Minimum days cannot be negative"],
      default: 3,
    },
    max: {
      type: Number,
      required: [true, "Maximum delivery time is required"],
      min: [0, "Maximum days cannot be negative"],
      default: 5,
    },
    unit: {
      type: String,
      enum: ["days", "business_days", "hours"],
      default: "business_days",
    },
    label: {
      type: String,
      trim: true,
      default: "3–5 Business Days",
    },
  },
  { _id: false }
);

const ShippingRegionsSchema = new Schema<IShippingRegions>(
  {
    type: {
      type: String,
      enum: ["all", "domestic", "international", "custom"],
      default: "all",
    },
    countries: {
      type: [String],
      default: [], // Upper-cased country codes, e.g. ["US", "IN"]
      set: (countries: string[]) =>
        (countries || []).map((c) => c.toUpperCase().trim()),
    },
  },
  { _id: false }
);

const ShippingMethodSchema = new Schema<IShippingMethod>(
  {
    name: {
      type: String,
      required: [true, "Shipping method name is required"],
      trim: true,
      maxlength: [100, "Shipping method name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [255, "Description cannot exceed 255 characters"],
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Shipping price is required"],
      min: [0, "Shipping price cannot be negative"],
      default: 0,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      default: "INR",
    },
    estimatedDays: {
      type: EstimatedDeliverySchema,
      required: true,
      default: () => ({
        min: 3,
        max: 5,
        unit: "business_days",
        label: "3–5 Business Days",
      }),
    },
    freeShippingThreshold: {
      type: Number,
      min: [0, "Free shipping threshold cannot be negative"],
      default: null, // Null means free shipping threshold is not active for this method
    },
    regions: {
      type: ShippingRegionsSchema,
      required: true,
      default: () => ({ type: "all", countries: [] }),
    },
    carrier: {
      type: String,
      trim: true,
      maxlength: [80, "Carrier name cannot exceed 80 characters"],
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug if not explicitly supplied
ShippingMethodSchema.pre("validate", function () {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Auto-generate human-friendly estimated delivery label if missing
  if (this.estimatedDays && !this.estimatedDays.label) {
    const unitText =
      this.estimatedDays.unit === "business_days"
        ? "Business Days"
        : this.estimatedDays.unit === "hours"
        ? "Hours"
        : "Days";
    this.estimatedDays.label = `${this.estimatedDays.min}–${this.estimatedDays.max} ${unitText}`;
  }
});

// Prevent re-compilation in Next.js hot reload
const ShippingMethod: Model<IShippingMethod> =
  mongoose.models.ShippingMethod ||
  mongoose.model<IShippingMethod>("ShippingMethod", ShippingMethodSchema);

export default ShippingMethod;
