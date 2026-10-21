import mongoose, { Schema, Model, Document } from "mongoose";

export type DiscountType = "percentage" | "fixed" | "free_shipping";

export interface ICoupon extends Document {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number; // e.g. 15 for 15%, or fixed value in store base currency (INR/USD)
  maxDiscountAmount?: number; // Cap for percentage discount in base currency
  minCartTotal?: number; // Minimum cart subtotal in base currency to qualify
  applicableProductIds?: string[]; // If set, discount applies ONLY to these items' subtotal
  requiredProductIds?: string[]; // Combo check: cart must contain these products together
  minItemQuantity?: number; // Minimum items in cart (e.g. buy 2+ items)
  maxUses?: number; // Global limit on redemptions
  usedCount: number; // Redemptions count
  maxUsesPerUser?: number; // Per-user redemption limit (default 1)
  allowedUserIds?: string[]; // Specific user IDs eligible for this coupon
  referrerUserId?: string; // Account that earns referral credit (future compatibility)
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed", "free_shipping"],
      default: "percentage",
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      min: 0,
    },
    minCartTotal: {
      type: Number,
      min: 0,
      default: 0,
    },
    applicableProductIds: {
      type: [String],
      default: [],
    },
    requiredProductIds: {
      type: [String],
      default: [],
    },
    minItemQuantity: {
      type: Number,
      min: 0,
      default: 0,
    },
    maxUses: {
      type: Number,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxUsesPerUser: {
      type: Number,
      default: 1,
      min: 1,
    },
    allowedUserIds: {
      type: [String],
      default: [],
    },
    referrerUserId: {
      type: String,
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose model overwrite error in Next.js hot-reloads
const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);

export default Coupon;
