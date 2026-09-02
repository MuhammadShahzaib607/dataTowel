"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Package,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

interface ProductImage {
  url: string;
  publicId: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subCategory: string;
  sizes: string[];
  price: number | null;
  discountedPrice: number | null;
  images: ProductImage[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAppSelector((state) => state.auth);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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
      setProduct(data.product);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [params.id, token]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Keyboard navigation for images
  useEffect(() => {
    if (!product || product.images.length <= 1) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setActiveImageIndex((prev) =>
          prev > 0 ? prev - 1 : product.images.length - 1
        );
      }
      if (e.key === "ArrowRight") {
        setActiveImageIndex((prev) =>
          prev < product.images.length - 1 ? prev + 1 : 0
        );
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [product]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "–";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[#96958D]" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-[640px]">
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

  const finalPrice = product.discountedPrice ?? product.price;

  return (
    <div>
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/admin/products")}
          className="flex items-center gap-2 text-[13px] font-medium text-[#6F6F69] hover:text-[#171717] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to Products
        </button>
      </div>

      {/* Top: Name + Status */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">
          {product.name || "Untitled Product"}
        </h1>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${
            product.isActive
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-[#96958D]"
          }`}
        >
          {product.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
        {/* LEFT: Image Gallery */}
        <div>
          <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6">
            {product.images.length > 0 ? (
              <>
                {/* Main Image */}
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-[#F2EFE8] mb-3">
                  <img
                    src={product.images[activeImageIndex].url}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActiveImageIndex((prev) =>
                            prev > 0
                              ? prev - 1
                              : product.images.length - 1
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#171717] hover:bg-white transition-colors cursor-pointer"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={() =>
                          setActiveImageIndex((prev) =>
                            prev < product.images.length - 1
                              ? prev + 1
                              : 0
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#171717] hover:bg-white transition-colors cursor-pointer"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                  {product.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/50 text-white text-[11px] font-medium">
                      {activeImageIndex + 1} / {product.images.length}
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {product.images.map((img, i) => (
                      <button
                        key={img.publicId || i}
                        onClick={() => setActiveImageIndex(i)}
                        className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                          i === activeImageIndex
                            ? "border-[#171717]"
                            : "border-transparent hover:border-[#D8CBB8]"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={`Thumbnail ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full aspect-[4/3] rounded-lg bg-[#F2EFE8] flex items-center justify-center">
                <ImageIcon size={40} className="text-[#D8CBB8]" />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Product Info */}
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6 space-y-5">
          {/* Category & Subcategory */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-1">
                Category
              </label>
              <p className="text-[14px] font-medium text-[#171717]">
                {product.category || "Not provided"}
              </p>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-1">
                Subcategory
              </label>
              <p className="text-[14px] font-medium text-[#171717]">
                {product.subCategory || "Not provided"}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-1">
              Description
            </label>
            <p className="text-[13px] text-[#6F6F69] leading-relaxed">
              {product.description || "Not provided"}
            </p>
          </div>

          {/* Prices */}
          <div>
            <label className="block text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-1.5">
              Pricing
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#FAFAF7] rounded-lg p-3">
                <p className="text-[10px] font-semibold text-[#96958D] uppercase tracking-wider mb-1">
                  Original
                </p>
                <p className="text-[15px] font-semibold text-[#171717]">
                  {product.price !== null ? `₨${product.price}` : "–"}
                </p>
              </div>
              <div className="bg-[#FAFAF7] rounded-lg p-3">
                <p className="text-[10px] font-semibold text-[#96958D] uppercase tracking-wider mb-1">
                  Discounted
                </p>
                <p className="text-[15px] font-semibold text-[#171717]">
                  {product.discountedPrice !== null
                    ? `₨${product.discountedPrice}`
                    : "–"}
                </p>
              </div>
              <div className="bg-[#FAFAF7] rounded-lg p-3">
                <p className="text-[10px] font-semibold text-[#96958D] uppercase tracking-wider mb-1">
                  Final
                </p>
                <p className="text-[15px] font-semibold text-[#171717]">
                  {finalPrice !== null ? `₨${finalPrice}` : "–"}
                </p>
                {product.discountedPrice !== null &&
                  product.price !== null &&
                  product.discountedPrice < product.price && (
                    <p className="text-[10px] text-green-600 mt-0.5">
                      Save ₨
                      {(product.price - product.discountedPrice).toFixed(0)}
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-1.5">
              Sizes
            </label>
            {product.sizes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#F2EFE8] text-[12px] font-medium text-[#171717]"
                  >
                    {size}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#96958D]">Not provided</p>
            )}
          </div>

          {/* Timestamps */}
          <div className="flex items-center gap-6 pt-4 border-t border-[#E8E6DF]/50">
            <div>
              <label className="block text-[10px] font-semibold text-[#96958D] uppercase tracking-wider mb-0.5">
                Created
              </label>
              <p className="text-[12px] text-[#6F6F69]">
                {formatDate(product.createdAt)}
              </p>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#96958D] uppercase tracking-wider mb-0.5">
                Updated
              </label>
              <p className="text-[12px] text-[#6F6F69]">
                {formatDate(product.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
