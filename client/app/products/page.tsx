"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Package, ImagePlus } from "lucide-react";

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

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/store/products`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setProducts(data.products || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      {/* Header */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 pt-32 pb-12">
        <h1 className="text-[32px] md:text-[40px] font-semibold text-[#171717] tracking-tight">
          Our Products
        </h1>
        <p className="mt-2 text-[15px] text-[#6F6F69] max-w-[600px]">
          Premium cotton towels, bedsheets and linens — supplied in bulk to hotels, restaurants, gyms and retailers.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-[#96958D]" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-16 text-center">
            <Package size={40} className="text-[#D8CBB8] mx-auto mb-4" />
            <p className="text-[16px] font-medium text-[#171717] mb-1">
              Unable to load products
            </p>
            <p className="text-[13px] text-[#96958D]">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-16 text-center">
            <Package size={40} className="text-[#D8CBB8] mx-auto mb-4" />
            <p className="text-[16px] font-medium text-[#171717] mb-1">
              No products available yet
            </p>
            <p className="text-[13px] text-[#96958D]">
              Check back soon for our premium collection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => {
              const finalPrice = product.discountedPrice ?? product.price;
              const hasDiscount =
                product.discountedPrice !== null &&
                product.price !== null &&
                product.discountedPrice! < product.price!;

              return (
                <div
                  key={product.id}
                  onClick={() => router.push(`/products/${product.id}`)}
                  className="group bg-white rounded-xl border border-[#E8E6DF]/50 overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-black/5 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/5] bg-[#F2EFE8] overflow-hidden">
                    {product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImagePlus size={32} className="text-[#D8CBB8]" />
                      </div>
                    )}
                    {hasDiscount && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#171717] text-white text-[10px] font-semibold tracking-wider uppercase">
                        Sale
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-[11px] text-[#96958D] uppercase tracking-wider mb-1">
                      {product.subCategory || product.category || ""}
                    </p>
                    <h3 className="text-[14px] font-medium text-[#171717] truncate mb-2">
                      {product.name || "Untitled"}
                    </h3>
                    <div className="flex items-center gap-2">
                      {finalPrice !== null ? (
                        <span className="text-[15px] font-semibold text-[#171717]">
                          ₨{finalPrice.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[13px] text-[#96958D]">
                          Contact for price
                        </span>
                      )}
                      {hasDiscount && product.price !== null && (
                        <span className="text-[13px] text-[#96958D] line-through">
                          ₨{product.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
