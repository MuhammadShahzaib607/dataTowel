"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  ImagePlus,
  Save,
  ToggleLeft,
  ToggleRight,
  Package,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import {
  CATEGORY_NAMES,
  getSubCategoriesForCategory,
  AVAILABLE_SIZES,
} from "@/lib/data/categories";
import CustomDropdown from "@/components/admin/CustomDropdown";
import SizeSelector from "@/components/admin/SizeSelector";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

interface ExistingImage {
  url: string;
  publicId: string;
}

interface ProductForm {
  name: string;
  description: string;
  category: string;
  subCategory: string;
  sizes: string[];
  price: string;
  discountedPrice: string;
  isActive: boolean;
}

const emptyForm: ProductForm = {
  name: "",
  description: "",
  category: "",
  subCategory: "",
  sizes: [],
  price: "",
  discountedPrice: "",
  isActive: true,
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE_URL}/products/${params.id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const p = data.product;
      setForm({
        name: p.name || "",
        description: p.description || "",
        category: p.category || "",
        subCategory: p.subCategory || "",
        sizes: Array.isArray(p.sizes) ? p.sizes : [],
        price: p.price !== null && p.price !== undefined ? String(p.price) : "",
        discountedPrice:
          p.discountedPrice !== null && p.discountedPrice !== undefined
            ? String(p.discountedPrice)
            : "",
        isActive: Boolean(p.isActive),
      });
      setExistingImages(Array.isArray(p.images) ? p.images : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [params.id, token]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Cleanup previews
  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p));
  }, [previews]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    previews.forEach((p) => URL.revokeObjectURL(p));
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeNewImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeExistingImage = (publicId: string) => {
    setExistingImages((prev) => prev.filter((img) => img.publicId !== publicId));
    setRemovedImageIds((prev) => [...prev, publicId]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("subCategory", form.subCategory);
      formData.append("sizes", JSON.stringify(form.sizes));
      formData.append("price", form.price || "");
      formData.append("discountedPrice", form.discountedPrice || "");
      formData.append("isActive", String(form.isActive));

      // Send removed image IDs so backend can delete them from Cloudinary
      if (removedImageIds.length > 0) {
        formData.append("removeImages", JSON.stringify(removedImageIds));
      }

      // Append new image files
      selectedFiles.forEach((f) => formData.append("images", f));

      const res = await fetch(`${API_BASE_URL}/products/${params.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  const subCategoryOptions = getSubCategoriesForCategory(form.category);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[#96958D]" />
      </div>
    );
  }

  if (error && !form.name && !form.category) {
    return (
      <div>
        <button
          onClick={() => router.push("/admin/products")}
          className="flex items-center gap-2 text-[13px] font-medium text-[#6F6F69] hover:text-[#171717] transition-colors cursor-pointer mb-8"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to Products
        </button>
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-16 text-center">
          <Package size={40} className="text-[#D8CBB8] mx-auto mb-4" />
          <p className="text-[16px] font-medium text-[#171717] mb-1">
            {error || "Product not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back + Title */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/admin/products")}
          className="flex items-center gap-2 text-[13px] font-medium text-[#6F6F69] hover:text-[#171717] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to Products
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">
          Edit Product
        </h1>
        <p className="mt-1 text-[14px] text-[#6F6F69]">
          Update product information for your store.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* LEFT COLUMN — Main Fields */}
          <div className="space-y-6">
            {/* Product Information Card */}
            <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6">
              <h2 className="text-[13px] font-semibold text-[#171717] mb-5">
                Product Information
              </h2>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Premium Bath Towel"
                    className="w-full h-11 px-4 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={4}
                    placeholder="Product description..."
                    className="w-full px-4 py-3 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all resize-none"
                  />
                </div>

                {/* Category & Subcategory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                      Category
                    </label>
                    <CustomDropdown
                      value={form.category}
                      options={CATEGORY_NAMES.map((c) => ({
                        label: c,
                        value: c,
                      }))}
                      placeholder="Select category"
                      onChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          category: val,
                          subCategory: "",
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                      Subcategory
                    </label>
                    <CustomDropdown
                      value={form.subCategory}
                      options={subCategoryOptions}
                      placeholder={
                        form.category
                          ? "Select subcategory"
                          : "Select category first"
                      }
                      onChange={(val) =>
                        setForm((prev) => ({ ...prev, subCategory: val }))
                      }
                      disabled={!form.category}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6">
              <h2 className="text-[13px] font-semibold text-[#171717] mb-5">
                Pricing
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                    Original Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full h-11 px-4 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                    Discounted Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.discountedPrice}
                    onChange={(e) =>
                      setForm({ ...form, discountedPrice: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full h-11 px-4 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Images Card */}
            <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6">
              <h2 className="text-[13px] font-semibold text-[#171717] mb-5">
                Images
              </h2>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] font-medium text-[#96958D] uppercase tracking-wider mb-3">
                    Current Images
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {existingImages.map((img) => (
                      <div
                        key={img.publicId}
                        className="relative aspect-square rounded-lg overflow-hidden bg-[#F2EFE8] group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt="Product"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.publicId)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Image Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 h-11 px-4 rounded-lg border border-dashed border-[#E8E6DF] text-[13px] text-[#6F6F69] hover:bg-[#F2EFE8] hover:border-[#D8CBB8] transition-all cursor-pointer w-full justify-center"
              >
                <ImagePlus size={16} strokeWidth={1.5} />
                {selectedFiles.length > 0
                  ? `${selectedFiles.length} new file(s) selected`
                  : "Add new images"}
              </button>
              {previews.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] font-medium text-[#96958D] uppercase tracking-wider mb-3">
                    New Images
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {previews.map((p, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-lg overflow-hidden bg-[#F2EFE8] group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p}
                          alt={`New preview ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN — Sidebar Fields */}
          <div className="space-y-6">
            {/* Sizes Card */}
            <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6">
              <h2 className="text-[13px] font-semibold text-[#171717] mb-5">
                Available Sizes
              </h2>
              <SizeSelector
                options={AVAILABLE_SIZES}
                selected={form.sizes}
                onChange={(sizes) => setForm({ ...form, sizes })}
              />
            </div>

            {/* Active Status Card */}
            <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6">
              <h2 className="text-[13px] font-semibold text-[#171717] mb-5">
                Status
              </h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, isActive: !form.isActive })
                  }
                  className="cursor-pointer"
                >
                  {form.isActive ? (
                    <ToggleRight
                      size={32}
                      className="text-[#171717]"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <ToggleLeft
                      size={32}
                      className="text-[#96958D]"
                      strokeWidth={1.5}
                    />
                  )}
                </button>
                <span className="text-[13px] text-[#6F6F69]">
                  {form.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin/products")}
                className="h-12 px-6 rounded-lg border border-[#E8E6DF] text-[14px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer flex-1 sm:flex-initial"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 h-12 rounded-lg bg-[#171717] text-white text-[14px] font-medium hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={18} strokeWidth={1.5} />
                    Update Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
