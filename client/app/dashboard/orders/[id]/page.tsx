"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Loader2, Upload, CheckCircle, XCircle, MessageCircle, Mail,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const WHATSAPP_NUMBER = "923403004439";
const CONTACT_EMAIL = "datatowel.admin@gmail.com";

interface OrderItem {
  product: string;
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

interface StatusHistoryEntry {
  status: string;
  changedAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
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
  statusHistory: StatusHistoryEntry[];
  isActive: boolean;
  createdAt: string;
}

const statusSteps = [
  "pending_payment",
  "processing",
  "dispatched",
  "delivered",
];

const statusLabels: Record<string, string> = {
  pending_payment: "Order Placed",
  processing: "Processing",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

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

const formatStatus = (s?: string | null) => {
  if (!s) return "Unknown";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAppSelector((state) => state.auth);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/store/orders/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [params.id, token]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadProof = async () => {
    if (!selectedFile || !order) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("screenshot", selectedFile);
      const res = await fetch(
        `${API_BASE_URL}/store/orders/${order.id}/payment-proof`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrder(data.order);
      setSelectedFile(null);
      setPreview("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload proof");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/store/orders/${order.id}/cancel`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrder(data.order);
      setCancelConfirm(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to cancel order"
      );
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const canCancel =
    order && ["pending_payment", "processing"].includes(order.orderStatus);

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
        <button
          onClick={() => router.push("/dashboard/orders")}
          className="flex items-center gap-2 text-[13px] font-medium text-[#6F6F69] hover:text-[#171717] cursor-pointer mb-6"
        >
          <ArrowLeft size={16} strokeWidth={1.5} /> Back to Orders
        </button>
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-16 text-center">
          <p className="text-[16px] font-medium text-[#171717]">
            {error || "Order not found"}
          </p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const orderLabel = order.orderNumber || `#${order.id.slice(-6).toUpperCase()}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello DataTowel, I want to contact you regarding my order ${orderLabel}.`)}`;
  const emailUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Order Inquiry - ${orderLabel}`)}`;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/orders")}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6F6F69] hover:bg-[#F2EFE8] hover:text-[#171717] transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <div>
            <h1 className="text-[20px] font-semibold text-[#171717] tracking-tight">
              {orderLabel}
            </h1>
            <p className="text-[12px] text-[#96958D] mt-0.5">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium ${statusColors[order.paymentStatus] || ""}`}
          >
            Payment: {formatStatus(order.paymentStatus)}
          </span>
          <span
            className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium ${statusColors[order.orderStatus] || ""}`}
          >
            Order: {formatStatus(order.orderStatus)}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-[13px] flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="cursor-pointer">
            X
          </button>
        </div>
      )}

      {/* Main content: two-column on desktop (matching admin layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Customer + Items */}
          <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px] mb-5">
              <div>
                <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-1">
                  Customer
                </p>
                <p className="text-[#171717] font-medium">
                  {order.customerName || "\u2013"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-1">
                  Email
                </p>
                <p className="text-[#171717]">
                  {order.customerEmail || "\u2013"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-1">
                  Date
                </p>
                <p className="text-[#171717]">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-1">
                  Total
                </p>
                <p className="text-[#171717] font-semibold">
                  \u20A8{order.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {order.notes && (
              <div className="mb-5">
                <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-1">
                  Notes
                </p>
                <p className="text-[13px] text-[#171717]">{order.notes}</p>
              </div>
            )}

            {/* Items */}
            {order.items.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-2">
                  Items
                </p>
                <div className="border border-[#E8E6DF]/50 rounded-lg overflow-hidden">
                  {order.items.map((item, i) => (
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
                          \u00D7{item.quantity}
                        </span>
                      </div>
                      <span className="text-[#171717] font-medium">
                        \u20A8{item.total.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bank Details */}
          {order.bankDetails?.bankName && (
            <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5">
              <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-2">
                Bank Payment
              </p>
              <p className="text-[12px] text-[#96958D] mb-3">
                Please transfer the exact order amount to the account below.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                <div>
                  <p className="text-[#96958D]">Account Title</p>
                  <p className="text-[#171717] font-medium">
                    {order.bankDetails.accountTitle}
                  </p>
                </div>
                <div>
                  <p className="text-[#96958D]">Bank</p>
                  <p className="text-[#171717]">
                    {order.bankDetails.bankName}
                  </p>
                </div>
                <div>
                  <p className="text-[#96958D]">Account Number</p>
                  <p className="text-[#171717] font-mono">
                    {order.bankDetails.accountNumber}
                  </p>
                </div>
                <div>
                  <p className="text-[#96958D]">IBAN</p>
                  <p className="text-[#171717] font-mono">
                    {order.bankDetails.iban}
                  </p>
                </div>
              </div>
              <div className="bg-[#FAFAF7] rounded-lg p-4 text-center mt-4">
                <p className="text-[12px] text-[#96958D] mb-1">
                  Amount to Pay
                </p>
                <p className="text-[24px] font-bold text-[#171717]">
                  \u20A8{order.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Payment Proof */}
          {order.paymentProof?.imageUrl && (
            <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5">
              <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-2">
                Payment Proof
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={order.paymentProof.imageUrl}
                alt="Payment proof"
                className="w-full max-w-[360px] rounded-lg border border-[#E8E6DF]/50"
              />
              <p className="text-[12px] text-[#96958D] mt-2">
                Submitted: {formatDateTime(order.paymentProof.submittedAt)}
              </p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Payment Screenshot Upload */}
          {order.orderStatus !== "cancelled" && (
            <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5">
              <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-3">
                Payment Screenshot
              </p>

              {(order.paymentStatus === "pending" ||
                order.paymentStatus === "rejected") && (
                <div>
                  {order.paymentStatus === "rejected" && (
                    <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-[12px]">
                      Payment proof was rejected. Please upload a valid
                      payment screenshot.
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {preview ? (
                    <div className="mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full max-w-[300px] rounded-lg border border-[#E8E6DF]/50"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 h-10 px-4 rounded-lg border border-dashed border-[#E8E6DF] text-[13px] text-[#6F6F69] hover:bg-[#F2EFE8] transition-all cursor-pointer w-full justify-center mb-3"
                    >
                      <Upload size={16} strokeWidth={1.5} />
                      Select screenshot
                    </button>
                  )}
                  {selectedFile && (
                    <button
                      onClick={handleUploadProof}
                      disabled={uploading}
                      className="flex items-center gap-2 h-10 px-5 rounded-lg bg-[#171717] text-white text-[13px] font-medium hover:bg-[#2a2a2a] disabled:opacity-50 transition-all cursor-pointer w-full justify-center"
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />{" "}
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} /> Submit Proof
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {order.paymentStatus === "submitted" && (
                <div className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-[12px]">
                  Payment proof submitted. Waiting for admin verification.
                </div>
              )}

              {order.paymentStatus === "verified" && (
                <div className="px-3 py-2 rounded-lg bg-green-50 text-green-700 text-[12px]">
                  Payment verified. Your order is being processed.
                </div>
              )}
            </div>
          )}

          {/* Order Status */}
          <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5">
            <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-3">
              Order Status
            </p>
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium ${statusColors[order.orderStatus] || ""}`}
            >
              {formatStatus(order.orderStatus)}
            </span>
          </div>

          {/* Order Summary with breakdown */}
          <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5">
            <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-3">
              Order Summary
            </p>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#96958D]">Items</span>
                <span className="text-[#171717]">{order.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#96958D]">Total Qty</span>
                <span className="text-[#171717]">
                  {order.items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              </div>
              <div className="h-px bg-[#E8E6DF]/50 my-2" />
              <div className="flex justify-between">
                <span className="text-[#96958D]">Subtotal</span>
                <span className="text-[#171717]">
                  \u20A8{(order.subtotal || order.totalAmount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#96958D]">Delivery</span>
                <span className="text-[#171717]">
                  \u20A8{(order.deliveryCharge || 0).toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-[#E8E6DF]/50 my-2" />
              <div className="flex justify-between">
                <span className="text-[#96958D] font-medium">Total</span>
                <span className="text-[#171717] font-semibold">
                  \u20A8{order.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5">
            <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-3">
              Contact
            </p>
            <div className="flex gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 h-10 px-4 rounded-lg bg-green-600 text-white text-[13px] font-medium hover:bg-green-700 transition-all cursor-pointer flex-1 justify-center"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
              <a
                href={emailUrl}
                className="flex items-center gap-2 h-10 px-4 rounded-lg border border-[#E8E6DF] text-[13px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer flex-1 justify-center"
              >
                <Mail size={14} /> Email
              </a>
            </div>
          </div>

          {/* Cancel Order */}
          {canCancel && (
            <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5">
              {!cancelConfirm ? (
                <button
                  onClick={() => setCancelConfirm(true)}
                  className="h-10 px-5 rounded-lg border border-red-200 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer w-full"
                >
                  Cancel Order
                </button>
              ) : (
                <div>
                  <p className="text-[13px] text-[#171717] mb-3">
                    Are you sure you want to cancel this order?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCancelConfirm(false)}
                      className="flex-1 h-10 px-4 rounded-lg border border-[#E8E6DF] text-[13px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer"
                    >
                      Keep Order
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="flex-1 h-10 px-4 rounded-lg bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {cancelling ? "Cancelling..." : "Cancel Order"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
