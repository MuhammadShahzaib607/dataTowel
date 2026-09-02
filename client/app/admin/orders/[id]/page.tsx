"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Loader2, Trash2, CheckCircle, XCircle, Phone,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { motion, AnimatePresence } from "framer-motion";

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
  statusHistory: { status: string; changedAt: string }[];
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

const formatStatus = (s?: string | null) => {
  if (!s) return "Unknown";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAppSelector((state) => state.auth);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE_URL}/orders/${params.id}`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [params.id, token]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const handleVerifyPayment = async () => {
    if (!order) return;
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${order.id}/verify-payment`, { method: "PATCH", headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify payment");
    }
  };

  const handleRejectPayment = async () => {
    if (!order) return;
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${order.id}/reject-payment`, { method: "PATCH", headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject payment");
    }
  };

  const handleUpdateStatus = async (orderStatus: string) => {
    if (!order) return;
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${order.id}/order-status`, {
        method: "PATCH", headers: authHeaders,
        body: JSON.stringify({ orderStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${order.id}`, { method: "DELETE", headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      router.push("/admin/orders");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete order");
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const formatDateTime = (d: string) => new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[#96958D]" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div>
        <button onClick={() => router.push("/admin/orders")} className="flex items-center gap-2 text-[13px] font-medium text-[#6F6F69] hover:text-[#171717] cursor-pointer mb-6">
          <ArrowLeft size={16} strokeWidth={1.5} /> Back to Orders
        </button>
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-16 text-center">
          <p className="text-[16px] font-medium text-[#171717]">{error || "Order not found"}</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const canDelete = !["dispatched", "delivered"].includes(order.orderStatus);

  return (
    <div>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setDeleteConfirm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-[380px] bg-white rounded-2xl shadow-2xl p-8 text-center">
                <h3 className="text-[18px] font-semibold text-[#171717] mb-2">Delete this order?</h3>
                <p className="text-[13px] text-[#6F6F69] mb-6">This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(false)} className="flex-1 h-11 rounded-lg border border-[#E8E6DF] text-[13px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer">Cancel</button>
                  <button onClick={handleDelete} disabled={deleting} className="flex-1 h-11 rounded-lg bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 disabled:opacity-50 transition-all cursor-pointer">
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/admin/orders")} className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6F6F69] hover:bg-[#F2EFE8] hover:text-[#171717] transition-colors cursor-pointer">
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <div>
            <h1 className="text-[20px] font-semibold text-[#171717] tracking-tight">
              {order.orderNumber || "Order Details"}
            </h1>
            <p className="text-[12px] text-[#96958D] mt-0.5">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium ${statusColors[order.paymentStatus] || ""}`}>
            Payment: {formatStatus(order.paymentStatus)}
          </span>
          <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium ${statusColors[order.orderStatus] || ""}`}>
            Order: {formatStatus(order.orderStatus)}
          </span>
          {canDelete && (
            <button onClick={() => setDeleteConfirm(true)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6F6F69] hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer ml-2">
              <Trash2 size={15} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-[13px] flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="cursor-pointer">X</button>
        </div>
      )}

      {/* Main content: two-column on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Customer + Items */}
          <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px] mb-5">
              <div>
                <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-1">Customer</p>
                <p className="text-[#171717] font-medium">{order.customerName || "\u2013"}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-1">Email</p>
                <p className="text-[#171717]">{order.customerEmail || "\u2013"}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-1">Date</p>
                <p className="text-[#171717]">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-1">Total</p>
                <p className="text-[#171717] font-semibold">\u20A8{order.totalAmount.toLocaleString()}</p>
              </div>
            </div>

            {order.notes && (
              <div className="mb-5">
                <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-1">Notes</p>
                <p className="text-[13px] text-[#171717]">{order.notes}</p>
              </div>
            )}

            {/* Items */}
            {order.items.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-2">Items</p>
                <div className="border border-[#E8E6DF]/50 rounded-lg overflow-hidden">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 text-[13px] border-b border-[#E8E6DF]/30 last:border-0">
                      <div>
                        <span className="text-[#171717]">{item.name || "Item"}</span>
                        {item.size && <span className="text-[#96958D] ml-2">({item.size})</span>}
                        <span className="text-[#96958D] ml-2">\u00D7{item.quantity}</span>
                      </div>
                      <span className="text-[#171717] font-medium">\u20A8{item.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payment Proof */}
          {order.paymentProof?.imageUrl && (
            <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5">
              <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-2">Payment Proof</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={order.paymentProof.imageUrl} alt="Payment proof" className="w-full max-w-[360px] rounded-lg border border-[#E8E6DF]/50" />
              <p className="text-[12px] text-[#96958D] mt-2">Submitted: {formatDateTime(order.paymentProof.submittedAt)}</p>
            </div>
          )}

          {/* Bank Details */}
          {order.bankDetails?.bankName && (
            <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5">
              <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-2">Bank Details Snapshot</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                <div>
                  <p className="text-[#96958D]">Account Title</p>
                  <p className="text-[#171717] font-medium">{order.bankDetails.accountTitle}</p>
                </div>
                <div>
                  <p className="text-[#96958D]">Bank</p>
                  <p className="text-[#171717]">{order.bankDetails.bankName}</p>
                </div>
                <div>
                  <p className="text-[#96958D]">Account Number</p>
                  <p className="text-[#171717] font-mono">{order.bankDetails.accountNumber}</p>
                </div>
                <div>
                  <p className="text-[#96958D]">IBAN</p>
                  <p className="text-[#171717] font-mono">{order.bankDetails.iban}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Status controls */}
        <div className="space-y-5">
          {/* Payment Actions */}
          {order.paymentStatus === "submitted" && (
            <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5">
              <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-3">Payment Review</p>
              <div className="flex gap-3">
                <button onClick={handleVerifyPayment} className="flex items-center gap-2 h-10 px-4 rounded-lg bg-green-600 text-white text-[13px] font-medium hover:bg-green-700 transition-all cursor-pointer flex-1">
                  <CheckCircle size={16} /> Verify
                </button>
                <button onClick={handleRejectPayment} className="flex items-center gap-2 h-10 px-4 rounded-lg border border-red-200 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer flex-1">
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          )}

          {/* Order Status Control */}
          <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5">
            <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-3">Order Status</p>
            <div className="flex flex-wrap gap-2">
              {orderStatusOptions.map((status) => {
                const isDisabled = ["processing", "dispatched", "delivered"].includes(status) && order.paymentStatus !== "verified";
                return (
                  <button
                    key={status}
                    onClick={() => !isDisabled && handleUpdateStatus(status)}
                    disabled={isDisabled}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      order.orderStatus === status
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

          {/* Quick Info */}
          <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5">
            <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-3">Quick Info</p>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#96958D]">Items</span>
                <span className="text-[#171717]">{order.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#96958D]">Total Qty</span>
                <span className="text-[#171717]">{order.items.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#96958D]">Amount</span>
                <span className="text-[#171717] font-semibold">\u20A8{order.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#96958D]">Active</span>
                <span className="text-[#171717]">{order.isActive ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          {order.customerEmail && (
            <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5">
              <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-3">Contact</p>
              <a
                href={`mailto:${order.customerEmail}`}
                className="flex items-center gap-2 h-10 px-4 rounded-lg border border-[#E8E6DF] text-[13px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer justify-center"
              >
                <Phone size={14} /> Email Customer
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
