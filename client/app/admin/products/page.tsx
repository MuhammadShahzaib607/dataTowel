"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Loader2,
  Trash2,
  X,
  ImagePlus,
  Package,
  Pencil,
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

export default function AdminProductsPage() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE_URL}/products`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProducts(data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDeleteConfirm(null);
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}/status`, {
        method: "PATCH",
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update status"
      );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">
            Products
          </h1>
          <p className="mt-1 text-[14px] text-[#6F6F69]">
            {products.length} product{products.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/products/new")}
          className="flex items-center gap-2 h-10 px-5 rounded-lg bg-[#171717] text-white text-[13px] font-medium hover:bg-[#2a2a2a] transition-all cursor-pointer"
        >
          <Plus size={16} strokeWidth={1.5} />
          Add Product
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-[13px] flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-[380px] bg-white rounded-2xl shadow-2xl p-8 text-center">
                <h3 className="text-[18px] font-semibold text-[#171717] mb-2">
                  Delete this product?
                </h3>
                <p className="text-[13px] text-[#6F6F69] mb-6">
                  This action cannot be undone. Associated images will also be
                  removed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 h-11 rounded-lg border border-[#E8E6DF] text-[13px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 h-11 rounded-lg bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 transition-all cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Products List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#96958D]" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-16 text-center">
          <Package size={40} className="text-[#D8CBB8] mx-auto mb-4" />
          <p className="text-[16px] font-medium text-[#171717] mb-1">
            No products yet
          </p>
          <p className="text-[13px] text-[#96958D] mb-6">
            Add your first product to get started.
          </p>
          <button
            onClick={() => router.push("/admin/products/new")}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#171717] text-white text-[13px] font-medium hover:bg-[#2a2a2a] transition-all cursor-pointer"
          >
            <Plus size={16} strokeWidth={1.5} />
            Add Product
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-[#E8E6DF]/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E6DF]/50">
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">
                    Price
                  </th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-[#E8E6DF]/30 last:border-0 hover:bg-[#FAFAF7] transition-colors cursor-pointer"
                    onClick={() =>
                      router.push(`/admin/products/${product.id}`)
                    }
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F2EFE8] flex-shrink-0">
                          {product.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.images[0].url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImagePlus
                                size={14}
                                className="text-[#D8CBB8]"
                              />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-[#171717] truncate">
                            {product.name || "Untitled"}
                          </p>
                          <p className="text-[11px] text-[#96958D]">
                            {product.sizes.length > 0
                              ? product.sizes.slice(0, 3).join(", ") +
                                (product.sizes.length > 3 ? "..." : "")
                              : "No sizes"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] text-[#6F6F69]">
                        {product.category || "–"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[13px]">
                        {product.discountedPrice !== null ? (
                          <>
                            <span className="line-through text-[#96958D]">
                              {product.price !== null
                                ? `₨${product.price}`
                                : "–"}
                            </span>
                            <span className="ml-2 text-[#171717] font-medium">
                              ₨{product.discountedPrice}
                            </span>
                          </>
                        ) : (
                          <span className="text-[#171717]">
                            {product.price !== null
                              ? `₨${product.price}`
                              : "–"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(product.id);
                        }}
                        className="cursor-pointer"
                      >
                        {product.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-[#96958D] text-[11px] font-medium">
                            Inactive
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            router.push(`/admin/products/${product.id}`)
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6F6F69] hover:bg-[#F2EFE8] hover:text-[#171717] transition-colors cursor-pointer"
                          title="View details"
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/admin/products/${product.id}/edit`)
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6F6F69] hover:bg-[#F2EFE8] hover:text-[#171717] transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <Pencil size={15} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6F6F69] hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-[#E8E6DF]/50 p-4 cursor-pointer"
                onClick={() =>
                  router.push(`/admin/products/${product.id}`)
                }
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F2EFE8] flex-shrink-0">
                    {product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImagePlus size={16} className="text-[#D8CBB8]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[#171717] truncate">
                      {product.name || "Untitled"}
                    </p>
                    <p className="text-[12px] text-[#96958D]">
                      {product.category || "No category"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(product.id);
                    }}
                    className="cursor-pointer flex-shrink-0"
                  >
                    {product.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-[#96958D] text-[10px] font-medium">
                        Inactive
                      </span>
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[13px]">
                    {product.discountedPrice !== null ? (
                      <>
                        <span className="line-through text-[#96958D]">
                          {product.price !== null ? `₨${product.price}` : "–"}
                        </span>
                        <span className="ml-2 font-medium">
                          ₨{product.discountedPrice}
                        </span>
                      </>
                    ) : (
                      <span>
                        {product.price !== null ? `₨${product.price}` : "–"}
                      </span>
                    )}
                  </div>
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() =>
                        router.push(`/admin/products/${product.id}`)
                      }
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6F6F69] hover:bg-[#F2EFE8] cursor-pointer"
                      title="View details"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        router.push(`/admin/products/${product.id}/edit`)
                      }
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6F6F69] hover:bg-[#F2EFE8] cursor-pointer"
                      title="Edit product"
                    >
                      <Pencil size={15} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(product.id)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6F6F69] hover:bg-red-50 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
