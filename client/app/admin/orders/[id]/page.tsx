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
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  city: string;
  paymentMethod: string;
  notes: string;
  paymentStatus: string;
  paymentProof: PaymentProof | null;
  bankDetails: BankDetails;
  orderStatus: string;
  cancellationReason: string;
  paymentRejectionReason: string;
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

// Linear order status steps for the timeline (excluding pending_payment)
const fulfillmentSteps = ["processing", "dispatched", "delivered"];

// Allowed forward-only transitions
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending_payment: ["processing", "cancelled"],
  processing: ["dispatched", "cancelled"],
  dispatched: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

const formatStatus = (s?: string | null) => {
  if (!s) return "Unknown";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

// Determine which timeline step index the current status is at
function getTimelineIndex(status: string): number {
  if (status === "cancelled") return -1; // special case
  const idx = fulfillmentSteps.indexOf(status);
  return idx >= 0 ? idx : -1;
}

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAppSelector((state) => state.auth);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Status update modal state
  const [statusModal, setStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Reject payment modal
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

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
    if (!order || !rejectReason.trim()) return;
    setRejecting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${order.id}/reject-payment`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrder(data.order);
      setRejectModal(false);
      setRejectReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject payment");
    } finally {
      setRejecting(false);
    }
  };

  // Open confirmation modal for status change
  const handleStatusClick = (newStatus: string) => {
    if (!order) return;
    const allowed = ALLOWED_TRANSITIONS[order.orderStatus] || [];
    if (!allowed.includes(newStatus)) return;
    setPendingStatus(newStatus);
    setCancelReason("");
    setStatusModal(true);
  };

  // Confirm and execute status update (non-optimistic)
  const handleConfirmStatusUpdate = async () => {
    if (!order || !pendingStatus) return;
    setStatusUpdating(true);
    try {
      const body: Record<string, string> = { orderStatus: pendingStatus };
      if (pendingStatus === "cancelled") {
        body.reason = cancelReason.trim();
      }
      const res = await fetch(`${API_BASE_URL}/orders/${order.id}/order-status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      // Only update UI after backend success
      setOrder(data.order);
      setStatusModal(false);
      setPendingStatus("");
      setCancelReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setStatusUpdating(false);
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

  const canDelete = !["dispatched", "delivered", "cancelled"].includes(order.orderStatus);
  const isTerminal = ["delivered", "cancelled"].includes(order.orderStatus);
  const currentTimelineIdx = getTimelineIndex(order.orderStatus);
  const isCancelled = order.orderStatus === "cancelled";
  const isPaymentVerified = order.paymentStatus === "verified";
  const allowedNext = ALLOWED_TRANSITIONS[order.orderStatus] || [];

  // Build timeline step data
  const timelineSteps = fulfillmentSteps.map((step, idx) => {
    let state: "completed" | "current" | "upcoming" | "disabled" = "upcoming";
    if (isCancelled) {
      // If cancelled, completed steps up to cancellation point stay completed
      if (currentTimelineIdx >= 0 && idx < currentTimelineIdx) {
        state = "completed";
      } else if (idx === currentTimelineIdx) {
        state = "completed"; // the step where cancellation happened
      } else {
        state = "disabled";
      }
    } else if (idx < currentTimelineIdx) {
      state = "completed";
    } else if (idx === currentTimelineIdx) {
      state = "current";
    } else {
      state = "upcoming";
    }
    return { step, state, label: formatStatus(step) };
  });

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

      {/* Status Update Confirmation Modal */}
      <AnimatePresence>
        {statusModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => { if (!statusUpdating) { setStatusModal(false); setPendingStatus(""); setCancelReason(""); } }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-8">
                <h3 className="text-[18px] font-semibold text-[#171717] mb-2">Update Order Status?</h3>
                {pendingStatus === "cancelled" ? (
                  <>
                    <p className="text-[13px] text-[#6F6F69] mb-4">
                      You are about to cancel order{" "}
                      <span className="font-medium text-[#171717]">{order.orderNumber || order.id.slice(0, 8)}</span>.
                    </p>
                    <div className="mb-4">
                      <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5">
                        Cancellation Reason <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Enter reason..."
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[13px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all resize-none"
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-[13px] text-[#6F6F69] mb-4">
                    You are about to change order{" "}
                    <span className="font-medium text-[#171717]">{order.orderNumber || order.id.slice(0, 8)}</span>
                    {" "}from{" "}
                    <span className="font-medium text-[#171717]">{formatStatus(order.orderStatus)}</span>
                    {" "}to{" "}
                    <span className="font-medium text-[#171717]">{formatStatus(pendingStatus)}</span>.
                  </p>
                )}

                {/* Status flow preview */}
                <div className="flex items-center gap-3 mb-6 px-3 py-3 rounded-lg bg-[#FAFAF7]">
                  <span className={`text-[12px] font-medium ${isCancelled ? "text-red-500" : "text-[#96958D] line-through"}`}>
                    {formatStatus(order.orderStatus)}
                  </span>
                  <span className="text-[#96958D]">→</span>
                  <span className={`text-[12px] font-medium ${pendingStatus === "cancelled" ? "text-red-500" : "text-green-600"}`}>
                    {formatStatus(pendingStatus)}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setStatusModal(false); setPendingStatus(""); setCancelReason(""); }}
                    disabled={statusUpdating}
                    className="flex-1 h-11 rounded-lg border border-[#E8E6DF] text-[13px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmStatusUpdate}
                    disabled={statusUpdating || (pendingStatus === "cancelled" && !cancelReason.trim())}
                    className={`flex-1 h-11 rounded-lg text-white text-[13px] font-medium hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      pendingStatus === "cancelled" ? "bg-red-500 hover:bg-red-600" : "bg-[#171717] hover:bg-[#2a2a2a]"
                    }`}
                  >
                    {statusUpdating ? (
                      <><Loader2 size={16} className="animate-spin" /> Updating...</>
                    ) : (
                      pendingStatus === "cancelled" ? "Cancel Order" : "Update Status"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Reject Payment Modal */}
      <AnimatePresence>
        {rejectModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => { setRejectModal(false); setRejectReason(""); }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-8">
                <h3 className="text-[18px] font-semibold text-[#171717] mb-2">Reject Payment</h3>
                <p className="text-[13px] text-[#6F6F69] mb-4">Please provide a reason for rejecting this payment.</p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Rejection reason..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[13px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all resize-none mb-4"
                />
                <div className="flex gap-3">
                  <button onClick={() => { setRejectModal(false); setRejectReason(""); }} className="flex-1 h-11 rounded-lg border border-[#E8E6DF] text-[13px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer">Close</button>
                  <button onClick={handleRejectPayment} disabled={rejecting || !rejectReason.trim()} className="flex-1 h-11 rounded-lg bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 disabled:opacity-50 transition-all cursor-pointer">
                    {rejecting ? "Rejecting..." : "Confirm Rejection"}
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
              {order.city && (
                <div>
                  <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-1">City</p>
                  <p className="text-[#171717]">{order.city}</p>
                </div>
              )}
              {order.paymentMethod && (
                <div>
                  <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-1">Payment</p>
                  <p className="text-[#171717]">{order.paymentMethod === "manual_transfer" ? "Manual Bank Transfer" : "Cash on Delivery"}</p>
                </div>
              )}
            </div>

            {order.notes && (
              <div className="mb-5">
                <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-1">Notes</p>
                <p className="text-[13px] text-[#171717]">{order.notes}</p>
              </div>
            )}

            {order.orderStatus === "cancelled" && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-[11px] font-semibold text-red-600 uppercase tracking-wider mb-1">Cancellation Reason</p>
                <p className="text-[13px] text-red-700">{order.cancellationReason || "No reason provided."}</p>
              </div>
            )}

            {order.paymentStatus === "rejected" && order.paymentRejectionReason && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-[11px] font-semibold text-red-600 uppercase tracking-wider mb-1">Payment Rejection Reason</p>
                <p className="text-[13px] text-red-700">{order.paymentRejectionReason}</p>
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
                <button onClick={() => setRejectModal(true)} className="flex items-center gap-2 h-10 px-4 rounded-lg border border-red-200 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer flex-1">
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          )}

          {/* Order Status Timeline */}
          <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5">
            <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-4">Order Status</p>

            {/* Timeline */}
            <div className="relative">
              {timelineSteps.map((item, idx) => {
                const isCompleted = item.state === "completed";
                const isCurrent = item.state === "current";
                const isUpcoming = item.state === "upcoming" && !isTerminal;
                const isDisabled = item.state === "disabled" || (item.state === "upcoming" && isTerminal);
                const canClick = isUpcoming && allowedNext.includes(item.step) && (isPaymentVerified || item.step === "cancelled");

                return (
                  <div key={item.step} className="flex items-start gap-3">
                    {/* Vertical line + dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 transition-all ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isCurrent
                              ? "bg-[#171717] text-white"
                              : isDisabled
                                ? "bg-[#E8E6DF]/50 text-[#96958D]"
                                : "bg-[#FAFAF7] text-[#96958D] border-2 border-[#E8E6DF]"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle size={14} />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      {/* Connector line */}
                      {idx < timelineSteps.length - 1 && (
                        <div className={`w-0.5 h-8 ${isCompleted ? "bg-green-500" : "bg-[#E8E6DF]/50"}`} />
                      )}
                    </div>

                    {/* Label + action */}
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-[13px] font-medium ${
                          isCompleted
                            ? "text-green-600"
                            : isCurrent
                              ? "text-[#171717]"
                              : isDisabled
                                ? "text-[#96958D]"
                                : "text-[#6F6F69]"
                        }`}>
                          {item.label}
                          {isCompleted && <span className="ml-2 text-[11px] text-green-500">(completed)</span>}
                          {isCurrent && <span className="ml-2 text-[11px] text-[#171717]">(current)</span>}
                        </span>
                        {canClick && (
                          <button
                            onClick={() => handleStatusClick(item.step)}
                            disabled={statusUpdating}
                            className="px-3 py-1 rounded-lg text-[11px] font-medium bg-[#171717] text-white hover:bg-[#2a2a2a] disabled:opacity-50 transition-all cursor-pointer"
                          >
                            Move to {item.label}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cancel button (when cancellation is allowed) */}
            {allowedNext.includes("cancelled") && (
              <div className="mt-4 pt-4 border-t border-[#E8E6DF]/50">
                <button
                  onClick={() => handleStatusClick("cancelled")}
                  disabled={statusUpdating}
                  className="w-full h-10 rounded-lg border border-red-200 text-[13px] font-medium text-red-500 hover:bg-red-50 disabled:opacity-50 transition-all cursor-pointer"
                >
                  Cancel Order
                </button>
              </div>
            )}

            {/* Payment verification warning */}
            {!isPaymentVerified && !isTerminal && (
              <div className="mt-4 pt-4 border-t border-[#E8E6DF]/50 text-[13px] text-center text-amber-600">
                Payment must be verified before updating order status.
              </div>
            )}

            {/* Terminal state message */}
            {isTerminal && (
              <div className={`mt-4 pt-4 border-t border-[#E8E6DF]/50 text-[13px] text-center ${isCancelled ? "text-red-500" : "text-green-600"}`}>
                {isCancelled ? "Order has been cancelled. No further changes possible." : "Order is delivered. No further changes possible."}
              </div>
            )}

            {/* Cancelled reason display */}
            {isCancelled && order.cancellationReason && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-red-50 text-[12px] text-red-600">
                <span className="font-medium">Reason:</span> {order.cancellationReason}
              </div>
            )}
          </div>

          {/* Order Summary with breakdown */}
          <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5">
            <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-3">Order Summary</p>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#96958D]">Items</span>
                <span className="text-[#171717]">{order.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#96958D]">Total Qty</span>
                <span className="text-[#171717]">{order.items.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div className="h-px bg-[#E8E6DF]/50 my-2" />
              <div className="flex justify-between">
                <span className="text-[#96958D]">Subtotal</span>
                <span className="text-[#171717]">\u20A8{(order.subtotal || order.totalAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#96958D]">Delivery</span>
                <span className="text-[#171717]">\u20A8{(order.deliveryCharge || 0).toLocaleString()}</span>
              </div>
              <div className="h-px bg-[#E8E6DF]/50 my-2" />
              <div className="flex justify-between">
                <span className="text-[#96958D] font-medium">Total</span>
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
