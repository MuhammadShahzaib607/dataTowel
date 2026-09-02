"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  ImagePlus,
  Save,
  ToggleLeft,
  ToggleRight,
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

export default function AddProductPage() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      selectedFiles.forEach((f) => formData.append("images", f));

      const res = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const subCategoryOptions = getSubCategoriesForCategory(form.category);

  return (
    <div className="max-w-[640px]">
      {/* Back + Title */}
      <div className="flex items-center gap-4 mb-8">
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
          Add Product
        </h1>
        <p className="mt-1 text-[14px] text-[#6F6F69]">
          Create a new product for your store.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-[13px]">
          {error}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
              Product Name
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
              rows={3}
              placeholder="Product description..."
              className="w-full px-4 py-3 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all resize-none"
            />
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                Category
              </label>
              <CustomDropdown
                value={form.category}
                options={CATEGORY_NAMES.map((c) => ({ label: c, value: c }))}
                placeholder="Select category"
                onChange={(val) =>
                  setForm({ ...form, category: val, subCategory: "" })
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
                  form.category ? "Select subcategory" : "Select category first"
                }
                onChange={(val) => setForm({ ...form, subCategory: val })}
                disabled={!form.category}
              />
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
              Sizes
            </label>
            <SizeSelector
              options={AVAILABLE_SIZES}
              selected={form.sizes}
              onChange={(sizes) => setForm({ ...form, sizes })}
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
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

          {/* Images */}
          <div>
            <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
              Images
            </label>
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
                ? `${selectedFiles.length} file(s) selected`
                : "Select images"}
            </button>
            {previews.length > 0 && (
              <div className="flex gap-2 mt-3">
                {previews.map((p, i) => (
                  <div
                    key={i}
                    className="w-16 h-16 rounded-lg overflow-hidden bg-[#F2EFE8] flex-shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
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

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="h-12 px-6 rounded-lg border border-[#E8E6DF] text-[14px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer"
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
                  Uploading &amp; Saving...
                </>
              ) : (
                <>
                  <Save size={18} strokeWidth={1.5} />
                  Add Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
