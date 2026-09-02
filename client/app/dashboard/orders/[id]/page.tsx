"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Upload,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

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
  totalAmount: number;
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

  const formatStatus = (s: string) =>
    s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

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
          className="flex items-center gap-2 text-[13px] font-medium text-[#6F6F69] hover:text-[#171717] cursor-pointer mb-8"
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

  return (
    <div>
      <button
        onClick={() => router.push("/dashboard/orders")}
        className="flex items-center gap-2 text-[13px] font-medium text-[#6F6F69] hover:text-[#171717] cursor-pointer mb-6"
      >
        <ArrowLeft size={16} strokeWidth={1.5} /> Back to Orders
      </button>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-[13px]">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#171717] tracking-tight">
            {order.orderNumber ||
              `#${order.id.slice(-6).toUpperCase()}`}
          </h1>
          <p className="text-[13px] text-[#96958D] mt-1">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${
              order.paymentStatus === "verified"
                ? "bg-green-50 text-green-700"
                : order.paymentStatus === "rejected"
                  ? "bg-red-50 text-red-700"
                  : order.paymentStatus === "submitted"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-yellow-50 text-yellow-700"
            }`}
          >
            {formatStatus(order.paymentStatus)}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${
              order.orderStatus === "delivered"
                ? "bg-green-50 text-green-700"
                : order.orderStatus === "cancelled"
                  ? "bg-gray-100 text-[#96958D]"
                  : "bg-blue-50 text-blue-700"
            }`}
          >
            {formatStatus(order.orderStatus)}
          </span>
        </div>
      </div>

      {/* Status Timeline */}
      {order.orderStatus !== "cancelled" ? (
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6 mb-6">
          <h2 className="text-[13px] font-semibold text-[#171717] mb-4">
            Order Progress
          </h2>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, i) => {
              const currentIndex = statusSteps.indexOf(order.orderStatus);
              const isComplete = i <= currentIndex;
              const isCurrent = i === currentIndex;
              return (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold ${
                      isComplete
                        ? "bg-[#171717] text-white"
                        : "bg-[#F2EFE8] text-[#96958D]"
                    } ${isCurrent ? "ring-2 ring-[#171717] ring-offset-2" : ""}`}
                  >
                    {isComplete ? "✓" : i + 1}
                  </div>
                  <p
                    className={`text-[11px] mt-2 text-center ${
                      isComplete
                        ? "text-[#171717] font-medium"
                        : "text-[#96958D]"
                    }`}
                  >
                    {statusLabels[step]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-red-50 rounded-xl border border-red-100 p-6 mb-6 text-center">
          <XCircle size={32} className="text-red-400 mx-auto mb-2" />
          <p className="text-[15px] font-medium text-red-700">
            Order Cancelled
          </p>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6 mb-6">
        <h2 className="text-[13px] font-semibold text-[#171717] mb-4">
          Items
        </h2>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-[#E8E6DF]/30 last:border-0"
            >
              <div>
                <span className="text-[13px] text-[#171717]">
                  {item.name || "Item"}
                </span>
                {item.size && (
                  <span className="text-[12px] text-[#96958D] ml-2">
                    ({item.size})
                  </span>
                )}
                <span className="text-[12px] text-[#96958D] ml-2">
                  ×{item.quantity}
                </span>
              </div>
              <span className="text-[13px] font-medium text-[#171717]">
                ₨{item.total.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-3 mt-2 border-t border-[#E8E6DF]/50">
          <span className="text-[14px] font-semibold text-[#171717]">
            Total
          </span>
          <span className="text-[16px] font-semibold text-[#171717]">
            ₨{order.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Bank Details */}
      {order.bankDetails && order.bankDetails.bankName && (
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6 mb-6">
          <h2 className="text-[13px] font-semibold text-[#171717] mb-1">
            Bank Payment
          </h2>
          <p className="text-[12px] text-[#96958D] mb-4">
            Please transfer the exact order amount to the account below.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-[11px] text-[#96958D] uppercase tracking-wider">
                Account Title
              </p>
              <p className="text-[14px] font-medium text-[#171717]">
                {order.bankDetails.accountTitle}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-[#96958D] uppercase tracking-wider">
                Bank Name
              </p>
              <p className="text-[14px] font-medium text-[#171717]">
                {order.bankDetails.bankName}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-[#96958D] uppercase tracking-wider">
                Account Number
              </p>
              <p className="text-[14px] font-medium text-[#171717] font-mono">
                {order.bankDetails.accountNumber}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-[#96958D] uppercase tracking-wider">
                IBAN
              </p>
              <p className="text-[14px] font-medium text-[#171717] font-mono">
                {order.bankDetails.iban}
              </p>
            </div>
          </div>
          <div className="bg-[#FAFAF7] rounded-lg p-4 text-center">
            <p className="text-[12px] text-[#96958D] mb-1">Amount to Pay</p>
            <p className="text-[24px] font-bold text-[#171717]">
              ₨{order.totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Payment Proof Section */}
      {order.orderStatus !== "cancelled" && (
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6 mb-6">
          <h2 className="text-[13px] font-semibold text-[#171717] mb-4">
            Payment Screenshot
          </h2>

          {order.paymentProof?.imageUrl && (
            <div className="mb-4">
              <p className="text-[11px] text-[#96958D] uppercase tracking-wider mb-2">
                Submitted Proof
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={order.paymentProof.imageUrl}
                alt="Payment proof"
                className="w-full max-w-[400px] rounded-lg border border-[#E8E6DF]/50"
              />
              <p className="text-[12px] text-[#96958D] mt-2">
                Submitted: {formatDateTime(order.paymentProof.submittedAt)}
              </p>
            </div>
          )}

          {(order.paymentStatus === "pending" ||
            order.paymentStatus === "rejected") && (
            <div>
              {order.paymentStatus === "rejected" && (
                <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-[12px]">
                  Payment proof was rejected. Please upload a valid payment
                  screenshot.
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
                    className="w-full max-w-[400px] rounded-lg border border-[#E8E6DF]/50"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 h-11 px-4 rounded-lg border border-dashed border-[#E8E6DF] text-[13px] text-[#6F6F69] hover:bg-[#F2EFE8] transition-all cursor-pointer w-full justify-center mb-3"
                >
                  <Upload size={16} strokeWidth={1.5} />
                  Select payment screenshot
                </button>
              )}
              {selectedFile && (
                <button
                  onClick={handleUploadProof}
                  disabled={uploading}
                  className="flex items-center gap-2 h-11 px-6 rounded-lg bg-[#171717] text-white text-[13px] font-medium hover:bg-[#2a2a2a] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />{" "}
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} /> Submit Payment Proof
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

      {/* Cancel Button */}
      {canCancel && (
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6">
          {!cancelConfirm ? (
            <button
              onClick={() => setCancelConfirm(true)}
              className="h-11 px-6 rounded-lg border border-red-200 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer"
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
                  className="h-10 px-5 rounded-lg border border-[#E8E6DF] text-[13px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="h-10 px-5 rounded-lg bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {cancelling ? "Cancelling..." : "Cancel Order"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
