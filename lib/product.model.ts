import mongoose, { Schema, Model } from "mongoose";

export interface IColorSwatch {
  hex: string;
  label?: string;
}

export interface IProduct {
  name: string;
  description: string;
  price: number;
  collection: string;
  images: string[]; // Array of Cloudinary image URLs
  sizes?: string[];
  colors?: IColorSwatch[];
  shapes?: string[];
  style?: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ColorSwatchSchema = new Schema<IColorSwatch>(
  {
    hex: { type: String, required: true },
    label: { type: String },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    collection: {
      type: String,
      required: [true, "Collection name is required"],
      trim: true,
    },
    images: {
      type: [String],
      required: [true, "At least one product image is required"],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "A product must have at least one image URL",
      },
    },
    sizes: {
      type: [String],
    },
    colors: {
      type: [ColorSwatchSchema],
      default: [],
    },
    shapes: {
      type: [String],
    },
    style: {
      type: String,
      trim: true,
    },
    badge: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose from recompiling model in Next.js hot reload
const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
