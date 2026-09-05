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

const bankDetailsSnapshotSchema = new mongoose.Schema(
  {
    accountTitle: { type: String, default: "" },
    bankName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    iban: { type: String, default: "" },
  },
  { _id: false }
);

const paymentProofSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
    submittedAt: { type: Date },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, default: "" },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      default: "",
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    customerName: { type: String, default: "" },
    customerEmail: { type: String, default: "" },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      default: 0,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    city: {
      type: String,
      default: "",
    },
    paymentMethod: {
      type: String,
      enum: ["manual_transfer", "cod"],
      default: "manual_transfer",
    },
    notes: {
      type: String,
      default: "",
      maxlength: 500,
    },
    // Payment
    paymentStatus: {
      type: String,
      enum: ["pending", "submitted", "verified", "rejected"],
      default: "pending",
    },
    paymentProof: paymentProofSchema,
    // Bank details snapshot at time of order
    bankDetails: bankDetailsSnapshotSchema,
    // Order fulfillment
    orderStatus: {
      type: String,
      enum: ["pending_payment", "processing", "dispatched", "delivered", "cancelled"],
      default: "pending_payment",
    },
    statusHistory: [statusHistorySchema],
    cancellationReason: {
      type: String,
      default: "",
    },
    paymentRejectionReason: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Soft delete / Trash
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ isActive: 1, createdAt: -1 });
orderSchema.index({ isDeleted: 1, createdAt: -1 });
// orderNumber already has a unique index from { unique: true } in the schema definition

const Order = mongoose.model("Order", orderSchema);

export default Order;
