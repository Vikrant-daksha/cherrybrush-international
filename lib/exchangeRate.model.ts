import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExchangeRate extends Document {
  baseCurrency: string;
  rates: Record<string, number>;
  provider: string;
  lastFetchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ExchangeRateSchema = new Schema<IExchangeRate>(
  {
    baseCurrency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true, // Only one document per base currency exists
    },
    rates: {
      type: Schema.Types.Mixed, // Flexible key-value map (e.g., { "EUR": 0.92, "INR": 83.5 })
      required: true,
    },
    provider: {
      type: String,
      default: "open.er-api.com",
    },
    lastFetchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent Mongoose from recompiling the model during Next.js Hot Reloading
const ExchangeRate: Model<IExchangeRate> =
  mongoose.models.ExchangeRate ||
  mongoose.model<IExchangeRate>("ExchangeRate", ExchangeRateSchema);

export default ExchangeRate;
