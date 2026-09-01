import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    publicId: { type: String, default: "" },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    subCategory: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    sizes: [
      {
        type: String,
        trim: true,
        maxlength: 100,
      },
    ],
    price: {
      type: Number,
      min: 0,
      default: null,
    },
    discountedPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    images: [productImageSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for filtering active products and category queries
productSchema.index({ isActive: 1, category: 1 });
productSchema.index({ name: "text" });

const Product = mongoose.model("Product", productSchema);

export default Product;
