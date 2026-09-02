"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Trash2, Eye, X, ShoppingCart, CheckCircle, XCircle, ChevronDown,
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

interface PaymentProof {
  imageUrl: string;
  submittedAt: string;
}

interface BankDetails {
  accountTitle: string;
  bankName: string;
  accountNumber: string;
  iban: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: { _id: string; username: string; email: string } | null;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  notes: string;
  paymentStatus: string;
  paymentProof: PaymentProof | null;
  bankDetails: BankDetails;
  orderStatus: string;
  isActive: boolean;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  submitted: "bg-blue-50 text-blue-700",
  verified: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  pending_payment: "bg-yellow-50 text-yellow-700",
  processing: "bg-blue-50 text-blue-700",
  dispatched: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-gray-100 text-[#96958D]",
};

const orderStatusOptions = [
  "pending_payment", "processing", "dispatched", "delivered", "cancelled",
];

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
      const res = await fetch(`${API_BASE_URL}/orders`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}`, { method: "DELETE", headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDeleteConfirm(null);
      setViewingOrder(null);
      fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleVerifyPayment = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/verify-payment`, { method: "PATCH", headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setViewingOrder(data.order);
      fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify payment");
    }
  };

  const handleRejectPayment = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/reject-payment`, { method: "PATCH", headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setViewingOrder(data.order);
      fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject payment");
    }
  };

  const handleUpdateStatus = async (id: string, orderStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/order-status`, {
        method: "PATCH", headers: authHeaders,
        body: JSON.stringify({ orderStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setViewingOrder(data.order);
      fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const formatStatus = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">Orders</h1>
        <p className="mt-1 text-[14px] text-[#6F6F69]">{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-[13px] flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="cursor-pointer"><X size={14} /></button>
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {viewingOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setViewingOrder(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
              <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-2xl mb-10" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-8 pt-8 pb-4">
                  <h2 className="text-[20px] font-semibold text-[#171717]">{viewingOrder.orderNumber || "Order Details"}</h2>
                  <button onClick={() => setViewingOrder(null)} className="w-8 h-8 flex items-center justify-center text-[#6F6F69] hover:text-[#171717] cursor-pointer"><X size={20} /></button>
                </div>
                <div className="px-8 pb-8 space-y-5">
                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-4 text-[13px]">
                    <div><p className="text-[#96958D] mb-1">Customer</p><p className="text-[#171717]">{viewingOrder.customerName || "–"}</p></div>
                    <div><p className="text-[#96958D] mb-1">Email</p><p className="text-[#171717]">{viewingOrder.customerEmail || "–"}</p></div>
                    <div><p className="text-[#96958D] mb-1">Date</p><p className="text-[#171717]">{formatDate(viewingOrder.createdAt)}</p></div>
                    <div><p className="text-[#96958D] mb-1">Total</p><p className="text-[#171717] font-semibold">₨{viewingOrder.totalAmount.toLocaleString()}</p></div>
                  </div>

                  {/* Status */}
                  <div className="flex gap-2">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium ${statusColors[viewingOrder.paymentStatus] || ""}`}>Payment: {formatStatus(viewingOrder.paymentStatus)}</span>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium ${statusColors[viewingOrder.orderStatus] || ""}`}>Order: {formatStatus(viewingOrder.orderStatus)}</span>
                  </div>

                  {/* Items */}
                  {viewingOrder.items.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-2">Items</p>
                      <div className="border border-[#E8E6DF]/50 rounded-lg overflow-hidden">
                        {viewingOrder.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-3 text-[13px] border-b border-[#E8E6DF]/30 last:border-0">
                            <div>
                              <span className="text-[#171717]">{item.name || "Item"}</span>
                              {item.size && <span className="text-[#96958D] ml-2">({item.size})</span>}
                              <span className="text-[#96958D] ml-2">×{item.quantity}</span>
                            </div>
                            <span className="text-[#171717] font-medium">₨{item.total.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bank Details */}
                  {viewingOrder.bankDetails?.bankName && (
                    <div>
                      <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-2">Bank Details Snapshot</p>
                      <div className="bg-[#FAFAF7] rounded-lg p-4 text-[13px] space-y-1">
                        <p><span className="text-[#96958D]">Account:</span> {viewingOrder.bankDetails.accountTitle}</p>
                        <p><span className="text-[#96958D]">Bank:</span> {viewingOrder.bankDetails.bankName}</p>
                        <p><span className="text-[#96958D]">Number:</span> {viewingOrder.bankDetails.accountNumber}</p>
                        <p><span className="text-[#96958D]">IBAN:</span> {viewingOrder.bankDetails.iban}</p>
                      </div>
                    </div>
                  )}

                  {/* Payment Proof */}
                  {viewingOrder.paymentProof?.imageUrl && (
                    <div>
                      <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-2">Payment Proof</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={viewingOrder.paymentProof.imageUrl} alt="Payment proof" className="w-full max-w-[400px] rounded-lg border border-[#E8E6DF]/50" />
                      <p className="text-[12px] text-[#96958D] mt-2">Submitted: {new Date(viewingOrder.paymentProof.submittedAt).toLocaleString()}</p>
                    </div>
                  )}

                  {/* Admin Payment Actions */}
                  {viewingOrder.paymentStatus === "submitted" && (
                    <div className="flex gap-3">
                      <button onClick={() => handleVerifyPayment(viewingOrder.id)} className="flex items-center gap-2 h-10 px-5 rounded-lg bg-green-600 text-white text-[13px] font-medium hover:bg-green-700 transition-all cursor-pointer">
                        <CheckCircle size={16} /> Verify Payment
                      </button>
                      <button onClick={() => handleRejectPayment(viewingOrder.id)} className="flex items-center gap-2 h-10 px-5 rounded-lg border border-red-200 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer">
                        <XCircle size={16} /> Reject Payment
                      </button>
                    </div>
                  )}

                  {/* Admin Status Control */}
                  <div>
                    <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-2">Order Status</p>
                    <div className="flex flex-wrap gap-2">
                      {orderStatusOptions.map((status) => {
                        const isDisabled = ["processing", "dispatched", "delivered"].includes(status) && viewingOrder.paymentStatus !== "verified";
                        return (
                          <button
                            key={status}
                            onClick={() => !isDisabled && handleUpdateStatus(viewingOrder.id, status)}
                            disabled={isDisabled}
                            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                              viewingOrder.orderStatus === status
                                ? "bg-[#171717] text-white border-[#171717]"
                                : "bg-[#FAFAF7] text-[#6F6F69] border-[#E8E6DF] hover:border-[#D8CBB8]"
                            }`}
                          >
                            {formatStatus(status)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => { setDeleteConfirm(viewingOrder.id); setViewingOrder(null); }} className="flex items-center gap-2 h-10 px-4 rounded-lg border border-red-200 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer">
                      <Trash2 size={14} strokeWidth={1.5} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-[380px] bg-white rounded-2xl shadow-2xl p-8 text-center">
                <h3 className="text-[18px] font-semibold text-[#171717] mb-2">Delete this order?</h3>
                <p className="text-[13px] text-[#6F6F69] mb-6">This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-11 rounded-lg border border-[#E8E6DF] text-[13px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer">Cancel</button>
                  <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 h-11 rounded-lg bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 transition-all cursor-pointer">Delete</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-[#96958D]" /></div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-16 text-center">
          <ShoppingCart size={40} className="text-[#D8CBB8] mx-auto mb-4" />
          <p className="text-[16px] font-medium text-[#171717] mb-1">No orders yet</p>
          <p className="text-[13px] text-[#96958D]">Orders will appear here once customers start placing them.</p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block bg-white rounded-xl border border-[#E8E6DF]/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E6DF]/50">
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">Order</th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">Total</th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">Payment</th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-[#E8E6DF]/30 last:border-0 hover:bg-[#FAFAF7] transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-[13px] font-medium text-[#171717]">{order.orderNumber || order.id.slice(0, 8)}</p>
                      <p className="text-[11px] text-[#96958D]">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] text-[#171717]">{order.customerName || "–"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] font-medium text-[#171717]">₨{order.totalAmount.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[order.paymentStatus] || ""}`}>{formatStatus(order.paymentStatus)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[order.orderStatus] || ""}`}>{formatStatus(order.orderStatus)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewingOrder(order)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6F6F69] hover:bg-[#F2EFE8] hover:text-[#171717] transition-colors cursor-pointer"><Eye size={15} strokeWidth={1.5} /></button>
                        <button onClick={() => setDeleteConfirm(order.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6F6F69] hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={15} strokeWidth={1.5} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border border-[#E8E6DF]/50 p-4 cursor-pointer" onClick={() => setViewingOrder(order)}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[14px] font-medium text-[#171717]">{order.orderNumber || order.id.slice(0, 8)}</p>
                    <p className="text-[12px] text-[#96958D]">{order.customerName || "Guest"} · {formatDate(order.createdAt)}</p>
                  </div>
                  <p className="text-[14px] font-semibold text-[#171717]">₨{order.totalAmount.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[order.paymentStatus] || ""}`}>{formatStatus(order.paymentStatus)}</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[order.orderStatus] || ""}`}>{formatStatus(order.orderStatus)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
