import mongoose from "mongoose";

const blogImageSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    publicId: { type: String, default: "" },
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    content: {
      type: String,
      default: "",
      maxlength: 50000,
    },
    category: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    images: [blogImageSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

blogSchema.index({ isActive: 1, createdAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ title: "text", content: "text" });

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
