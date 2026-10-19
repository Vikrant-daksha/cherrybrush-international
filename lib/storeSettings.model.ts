import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStoreSettings extends Document {
  key: string;
  baseCurrency: string;
  updatedAt: Date;
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "general",
    },
    baseCurrency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      default: "INR",
    },
  },
  {
    timestamps: true,
  }
);

const StoreSettings: Model<IStoreSettings> =
  mongoose.models.StoreSettings ||
  mongoose.model<IStoreSettings>("StoreSettings", StoreSettingsSchema);

export default StoreSettings;
