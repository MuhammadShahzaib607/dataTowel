"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Trash2,
  Eye,
  X,
  ShoppingCart,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  customer: { _id: string; username: string; email: string } | null;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  notes: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const { token } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE_URL}/orders`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDeleteConfirm(null);
      setViewingOrder(null);
      fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete order");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: "PATCH",
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">
          Orders
        </h1>
        <p className="mt-1 text-[14px] text-[#6F6F69]">
          {orders.length} order{orders.length !== 1 ? "s" : ""} total
        </p>
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

      {/* View Order Modal */}
      <AnimatePresence>
        {viewingOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setViewingOrder(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto"
            >
              <div
                className="w-full max-w-[500px] bg-white rounded-2xl shadow-2xl mb-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-8 pt-8 pb-4">
                  <h2 className="text-[20px] font-semibold text-[#171717]">
                    Order Details
                  </h2>
                  <button
                    onClick={() => setViewingOrder(null)}
                    className="w-8 h-8 flex items-center justify-center text-[#6F6F69] hover:text-[#171717] cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="px-8 pb-8 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-[13px]">
                    <div>
                      <p className="text-[#96958D] mb-1">Order ID</p>
                      <p className="text-[#171717] font-mono text-[12px]">
                        {viewingOrder.id.slice(0, 12)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-[#96958D] mb-1">Date</p>
                      <p className="text-[#171717]">
                        {formatDate(viewingOrder.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#96958D] mb-1">Customer</p>
                      <p className="text-[#171717]">
                        {viewingOrder.customerName || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#96958D] mb-1">Status</p>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          viewingOrder.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-[#96958D]"
                        }`}
                      >
                        {viewingOrder.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  {viewingOrder.items.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-2">
                        Items
                      </p>
                      <div className="border border-[#E8E6DF]/50 rounded-lg overflow-hidden">
                        {viewingOrder.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between px-4 py-3 text-[13px] border-b border-[#E8E6DF]/30 last:border-0"
                          >
                            <div>
                              <span className="text-[#171717]">
                                {item.name || "Item"}
                              </span>
                              {item.size && (
                                <span className="text-[#96958D] ml-2">
                                  ({item.size})
                                </span>
                              )}
                              <span className="text-[#96958D] ml-2">
                                ×{item.quantity}
                              </span>
                            </div>
                            <span className="text-[#171717] font-medium">
                              ₨{item.total}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#E8E6DF]/50">
                    <span className="text-[13px] font-semibold text-[#171717]">
                      Total
                    </span>
                    <span className="text-[16px] font-semibold text-[#171717]">
                      ₨{viewingOrder.totalAmount}
                    </span>
                  </div>

                  {viewingOrder.notes && (
                    <div>
                      <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-1">
                        Notes
                      </p>
                      <p className="text-[13px] text-[#6F6F69]">
                        {viewingOrder.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setDeleteConfirm(viewingOrder.id);
                        setViewingOrder(null);
                      }}
                      className="flex items-center gap-2 h-10 px-4 rounded-lg border border-red-200 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                  Delete this order?
                </h3>
                <p className="text-[13px] text-[#6F6F69] mb-6">
                  This action cannot be undone.
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

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#96958D]" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-16 text-center">
          <ShoppingCart size={40} className="text-[#D8CBB8] mx-auto mb-4" />
          <p className="text-[16px] font-medium text-[#171717] mb-1">
            No orders yet
          </p>
          <p className="text-[13px] text-[#96958D]">
            Orders will appear here once customers start placing them.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-[#E8E6DF]/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E6DF]/50">
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">
                    Order
                  </th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">
                    Total
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
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#E8E6DF]/30 last:border-0 hover:bg-[#FAFAF7] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-[12px] font-mono text-[#6F6F69]">
                        {order.id.slice(0, 8)}...
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] text-[#171717]">
                        {order.customerName || "—"}
                      </p>
                      <p className="text-[11px] text-[#96958D]">
                        {order.customerEmail || "—"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] text-[#6F6F69]">
                        {formatDate(order.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] font-medium text-[#171717]">
                        ₨{order.totalAmount}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(order.id)}
                        className="cursor-pointer"
                      >
                        {order.isActive ? (
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
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6F6F69] hover:bg-[#F2EFE8] hover:text-[#171717] transition-colors cursor-pointer"
                        >
                          <Eye size={15} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(order.id)}
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
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-[#E8E6DF]/50 p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[13px] font-medium text-[#171717]">
                      {order.customerName || "Guest"}
                    </p>
                    <p className="text-[11px] text-[#96958D] font-mono">
                      {order.id.slice(0, 12)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(order.id)}
                    className="cursor-pointer flex-shrink-0"
                  >
                    {order.isActive ? (
                      <ToggleRight size={28} className="text-[#171717]" />
                    ) : (
                      <ToggleLeft size={28} className="text-[#96958D]" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[13px] text-[#6F6F69]">
                    {formatDate(order.createdAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-[#171717]">
                      ₨{order.totalAmount}
                    </span>
                    <button
                      onClick={() => setViewingOrder(order)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6F6F69] hover:bg-[#F2EFE8] cursor-pointer"
                    >
                      <Eye size={15} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(order.id)}
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
