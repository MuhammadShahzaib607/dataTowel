"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Package,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { useAppDispatch } from "@/lib/hooks";
import { addToCart } from "@/lib/store/cartSlice";

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
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE_URL}/store/products/${params.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProduct(data.product);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

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

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes.length > 0 && !selectedSize) return;

    const finalPrice = product.discountedPrice ?? product.price ?? 0;
    const mainImage = product.images[0]?.url || "";

    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: finalPrice,
        image: mainImage,
        quantity,
        variant: selectedSize || undefined,
      })
    );

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#96958D]" />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#FAFAF7]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-16 pt-32">
          <button
            onClick={() => router.push("/products")}
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
      </main>
    );
  }

  const finalPrice = product.discountedPrice ?? product.price;
  const hasDiscount =
    product.discountedPrice !== null &&
    product.price !== null &&
    product.discountedPrice! < product.price!;

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 pt-32 pb-20">
        {/* Back */}
        <button
          onClick={() => router.push("/products")}
          className="flex items-center gap-2 text-[13px] font-medium text-[#6F6F69] hover:text-[#171717] transition-colors cursor-pointer mb-8"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to Products
        </button>

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* LEFT: Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#F2EFE8] mb-4">
              {product.images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[activeImageIndex].url}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImagePlus size={48} className="text-[#D8CBB8]" />
                </div>
              )}
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#171717] hover:bg-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev < product.images.length - 1
                          ? prev + 1
                          : 0
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#171717] hover:bg-white transition-colors cursor-pointer"
                  >
                    <ChevronRight size={20} />
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
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex flex-col">
            {/* Category */}
            <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-2">
              {product.subCategory || product.category || ""}
            </p>

            {/* Name */}
            <h1 className="text-[28px] md:text-[32px] font-semibold text-[#171717] tracking-tight mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              {finalPrice !== null ? (
                <span className="text-[24px] font-semibold text-[#171717]">
                  ₨{finalPrice.toLocaleString()}
                </span>
              ) : (
                <span className="text-[16px] text-[#96958D]">
                  Contact for pricing
                </span>
              )}
              {hasDiscount && product.price !== null && (
                <span className="text-[16px] text-[#96958D] line-through">
                  ₨{product.price.toLocaleString()}
                </span>
              )}
              {hasDiscount && (
                <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-medium">
                  Save ₨
                  {((product.price! - product.discountedPrice!) as number).toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-[14px] text-[#6F6F69] leading-relaxed mb-6">
                {product.description}
              </p>
            )}

            <div className="h-px bg-[#E8E6DF]/50 mb-6" />

            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div className="mb-6">
                <label className="block text-[12px] font-medium text-[#6F6F69] mb-3 uppercase tracking-wider">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2.5 rounded-lg text-[13px] font-medium border transition-all cursor-pointer ${
                        selectedSize === size
                          ? "bg-[#171717] text-white border-[#171717]"
                          : "bg-[#FAFAF7] text-[#6F6F69] border-[#E8E6DF] hover:border-[#D8CBB8] hover:bg-[#F2EFE8]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-[12px] font-medium text-[#6F6F69] mb-3 uppercase tracking-wider">
                Quantity
              </label>
              <div className="inline-flex items-center border border-[#E8E6DF] rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-[#6F6F69] hover:bg-[#F2EFE8] transition-colors cursor-pointer"
                >
                  <Minus size={16} strokeWidth={1.5} />
                </button>
                <span className="w-12 h-11 flex items-center justify-center text-[14px] font-medium text-[#171717] border-x border-[#E8E6DF]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-11 h-11 flex items-center justify-center text-[#6F6F69] hover:bg-[#F2EFE8] transition-colors cursor-pointer"
                >
                  <Plus size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.sizes.length > 0 && !selectedSize}
              className={`w-full h-13 rounded-xl text-[15px] font-medium transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                addedToCart
                  ? "bg-green-600 text-white"
                  : "bg-[#171717] text-white hover:bg-[#2a2a2a]"
              }`}
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {addedToCart
                ? "Added to Cart!"
                : product.sizes.length > 0 && !selectedSize
                  ? "Select a size first"
                  : "Add to Cart"}
            </button>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-[#E8E6DF]/50 space-y-3">
              {product.category && (
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="text-[#96958D]">Category:</span>
                  <span className="text-[#171717] font-medium">
                    {product.category}
                  </span>
                </div>
              )}
              {product.subCategory && (
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="text-[#96958D]">Type:</span>
                  <span className="text-[#171717] font-medium">
                    {product.subCategory}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
