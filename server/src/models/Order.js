import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    name: { type: String, default: "" },
    size: { type: String, default: "" },
    quantity: { type: Number, default: 1, min: 0 },
    price: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    customerName: { type: String, default: "" },
    customerEmail: { type: String, default: "" },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ isActive: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
