"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Loader2, Trash2, Eye, X, ShoppingCart, Search, SlidersHorizontal,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import CustomDropdown from "@/components/admin/CustomDropdown";

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
  customer: { _id: string; username: string; email: string; phone?: string } | null;
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

const orderStatusFilterOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Pending Payment", value: "pending_payment" },
  { label: "Processing", value: "processing" },
  { label: "Dispatched", value: "dispatched" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const paymentStatusFilterOptions = [
  { label: "All Payment Statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Submitted", value: "submitted" },
  { label: "Verified", value: "verified" },
  { label: "Rejected", value: "rejected" },
];

interface Filters {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderStatus: string;
  paymentStatus: string;
  fromDate: string;
  toDate: string;
  minAmount: string;
  maxAmount: string;
}

const defaultFilters: Filters = {
  orderId: "",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  orderStatus: "all",
  paymentStatus: "all",
  fromDate: "",
  toDate: "",
  minAmount: "",
  maxAmount: "",
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const buildQueryParams = useCallback((f: Filters) => {
    const params = new URLSearchParams();
    if (f.orderId.trim()) params.set("orderId", f.orderId.trim());
    if (f.customerName.trim()) params.set("customerName", f.customerName.trim());
    if (f.customerEmail.trim()) params.set("customerEmail", f.customerEmail.trim());
    if (f.customerPhone.trim()) params.set("customerPhone", f.customerPhone.trim());
    if (f.orderStatus !== "all") params.set("orderStatus", f.orderStatus);
    if (f.paymentStatus !== "all") params.set("paymentStatus", f.paymentStatus);
    if (f.fromDate) params.set("fromDate", f.fromDate);
    if (f.toDate) params.set("toDate", f.toDate);
    if (f.minAmount) params.set("minAmount", f.minAmount);
    if (f.maxAmount) params.set("maxAmount", f.maxAmount);
    return params.toString();
  }, []);

  const fetchOrders = useCallback(async (f: Filters) => {
    try {
      setLoading(true);
      setError("");
      const qs = buildQueryParams(f);
      const url = qs ? `${API_BASE_URL}/orders?${qs}` : `${API_BASE_URL}/orders`;
      const res = await fetch(url, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [token, buildQueryParams]);

  useEffect(() => { fetchOrders(defaultFilters); }, [fetchOrders]);

  // Debounced fetch for text inputs
  const debouncedFetch = useCallback((f: Filters) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchOrders(f), 400);
  }, [fetchOrders]);

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    // For dropdowns, fetch immediately; for text, debounce
    if (key === "orderStatus" || key === "paymentStatus" || key === "fromDate" || key === "toDate") {
      fetchOrders(next);
    } else {
      debouncedFetch(next);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      fetchOrders(filters);
    }
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    fetchOrders(defaultFilters);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, val]) => {
    if (key === "orderStatus" || key === "paymentStatus") return val !== "all";
    return val !== "";
  });

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}`, { method: "DELETE", headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDeleteConfirm(null);
      fetchOrders(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const formatStatus = (s?: string | null) => {
    if (!s) return "Unknown";
    return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Build active filter chips
  const activeChips: { label: string; key: keyof Filters }[] = [];
  if (filters.orderId) activeChips.push({ label: `Order ID: ${filters.orderId}`, key: "orderId" });
  if (filters.customerName) activeChips.push({ label: `Customer: ${filters.customerName}`, key: "customerName" });
  if (filters.customerEmail) activeChips.push({ label: `Email: ${filters.customerEmail}`, key: "customerEmail" });
  if (filters.customerPhone) activeChips.push({ label: `Phone: ${filters.customerPhone}`, key: "customerPhone" });
  if (filters.orderStatus !== "all") activeChips.push({ label: `Status: ${formatStatus(filters.orderStatus)}`, key: "orderStatus" });
  if (filters.paymentStatus !== "all") activeChips.push({ label: `Payment: ${formatStatus(filters.paymentStatus)}`, key: "paymentStatus" });
  if (filters.fromDate) activeChips.push({ label: `From: ${filters.fromDate}`, key: "fromDate" });
  if (filters.toDate) activeChips.push({ label: `To: ${filters.toDate}`, key: "toDate" });
  if (filters.minAmount) activeChips.push({ label: `Min: \u20A8${filters.minAmount}`, key: "minAmount" });
  if (filters.maxAmount) activeChips.push({ label: `Max: \u20A8${filters.maxAmount}`, key: "maxAmount" });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">Orders</h1>
          <p className="mt-1 text-[14px] text-[#6F6F69]">
            {orders.length} order{orders.length !== 1 ? "s" : ""} total
            {hasActiveFilters && " (filtered)"}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 h-9 px-4 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
            showFilters || hasActiveFilters
              ? "bg-[#171717] text-white"
              : "bg-white border border-[#E8E6DF] text-[#6F6F69] hover:border-[#D8CBB8]"
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
        </button>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-[13px] flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="cursor-pointer"><X size={14} /></button>
        </div>
      )}

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-6"
          >
            <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5">
              {/* Text search row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96958D]" />
                  <input
                    type="text"
                    placeholder="Search by Order ID"
                    value={filters.orderId}
                    onChange={(e) => updateFilter("orderId", e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[13px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
                  />
                </div>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96958D]" />
                  <input
                    type="text"
                    placeholder="Search customer..."
                    value={filters.customerName}
                    onChange={(e) => updateFilter("customerName", e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[13px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
                  />
                </div>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96958D]" />
                  <input
                    type="text"
                    placeholder="Search email..."
                    value={filters.customerEmail}
                    onChange={(e) => updateFilter("customerEmail", e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[13px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
                  />
                </div>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96958D]" />
                  <input
                    type="text"
                    placeholder="Search phone..."
                    value={filters.customerPhone}
                    onChange={(e) => updateFilter("customerPhone", e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[13px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
                  />
                </div>
              </div>

              {/* Dropdowns + date/amount row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <CustomDropdown
                  value={filters.orderStatus}
                  options={orderStatusFilterOptions}
                  placeholder="Order Status"
                  onChange={(val) => updateFilter("orderStatus", val)}
                />
                <CustomDropdown
                  value={filters.paymentStatus}
                  options={paymentStatusFilterOptions}
                  placeholder="Payment Status"
                  onChange={(val) => updateFilter("paymentStatus", val)}
                />
                <input
                  type="date"
                  placeholder="From Date"
                  value={filters.fromDate}
                  onChange={(e) => updateFilter("fromDate", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[13px] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
                />
                <input
                  type="date"
                  placeholder="To Date"
                  value={filters.toDate}
                  onChange={(e) => updateFilter("toDate", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[13px] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
                />
              </div>

              {/* Amount range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <input
                  type="number"
                  placeholder="Min Amount"
                  value={filters.minAmount}
                  onChange={(e) => updateFilter("minAmount", e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full h-10 px-3 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[13px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
                />
                <input
                  type="number"
                  placeholder="Max Amount"
                  value={filters.maxAmount}
                  onChange={(e) => updateFilter("maxAmount", e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full h-10 px-3 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[13px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
                />
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="h-10 px-4 rounded-lg border border-[#E8E6DF] text-[13px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Active filter chips */}
              {activeChips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activeChips.map((chip) => (
                    <span
                      key={chip.key}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F2EFE8] text-[11px] font-medium text-[#6F6F69]"
                    >
                      {chip.label}
                      <button
                        onClick={() => updateFilter(chip.key, defaultFilters[chip.key])}
                        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-[#E8E6DF] cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={clearFilters}
                    className="text-[11px] font-medium text-[#6F6F69] hover:text-[#171717] cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </motion.div>
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
          <p className="text-[16px] font-medium text-[#171717] mb-1">
            {hasActiveFilters ? "No orders found matching your filters" : "No orders yet"}
          </p>
          <p className="text-[13px] text-[#96958D] mb-4">
            {hasActiveFilters ? "Try adjusting your search criteria." : "Orders will appear here once customers start placing them."}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="h-10 px-5 rounded-lg border border-[#E8E6DF] text-[13px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer">
              Clear Filters
            </button>
          )}
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
                      <p className="text-[13px] text-[#171717]">{order.customerName || "\u2013"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] font-medium text-[#171717]">\u20A8{order.totalAmount.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[order.paymentStatus] || ""}`}>{formatStatus(order.paymentStatus)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[order.orderStatus] || ""}`}>{formatStatus(order.orderStatus)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => router.push(`/admin/orders/${order.id}`)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6F6F69] hover:bg-[#F2EFE8] hover:text-[#171717] transition-colors cursor-pointer"><Eye size={15} strokeWidth={1.5} /></button>
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
              <div key={order.id} className="bg-white rounded-xl border border-[#E8E6DF]/50 p-4 cursor-pointer" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[14px] font-medium text-[#171717]">{order.orderNumber || order.id.slice(0, 8)}</p>
                    <p className="text-[12px] text-[#96958D]">{order.customerName || "Guest"} \u00B7 {formatDate(order.createdAt)}</p>
                  </div>
                  <p className="text-[14px] font-semibold text-[#171717]">\u20A8{order.totalAmount.toLocaleString()}</p>
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
