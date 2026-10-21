import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IUserCartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  collectionName?: string;
  style?: string;
  shape?: string;
  length?: string;
  size?: string;
  color?: string;
  shade?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  password: string;
  role: "admin" | "user";
  orders: Types.ObjectId[];
  cart: IUserCartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const UserCartItemSchema = new Schema<IUserCartItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    collectionName: { type: String, trim: true },
    style: { type: String, trim: true },
    shape: { type: String, trim: true },
    length: { type: String, trim: true },
    size: { type: String, trim: true },
    color: { type: String, trim: true },
    shade: { type: String, trim: true },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      alias: "phoneNumber",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    cart: {
      type: [UserCartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Hot-reload cache invalidation for Next.js dev server
if (mongoose.models.User && !mongoose.models.User.schema.paths.orders) {
  delete (mongoose.models as any).User;
}

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

