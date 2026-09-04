"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Package, ChevronRight, Search, SlidersHorizontal, X, Trash2, RotateCcw } from "lucide-react";
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

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  isDeleted: boolean;
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
  { label: "All Orders", value: "all" },
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
  orderStatus: string;
  paymentStatus: string;
  fromDate: string;
  toDate: string;
}

const defaultFilters: Filters = {
  orderId: "",
  orderStatus: "all",
  paymentStatus: "all",
  fromDate: "",
  toDate: "",
};

const formatStatus = (s?: string | null) => {
  if (!s) return "Unknown";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function UserOrdersPage() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "trash">("orders");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOrders = useCallback(async (f: Filters, trash = false) => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (f.orderId.trim()) params.set("orderId", f.orderId.trim());
      if (f.orderStatus !== "all") params.set("orderStatus", f.orderStatus);
      if (f.paymentStatus !== "all") params.set("paymentStatus", f.paymentStatus);
      if (f.fromDate) params.set("fromDate", f.fromDate);
      if (f.toDate) params.set("toDate", f.toDate);
      if (trash) params.set("isDeleted", "true");
      const qs = params.toString();
      const url = qs ? `${API_BASE_URL}/store/orders/mine?${qs}` : `${API_BASE_URL}/store/orders/mine`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
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
    fetchOrders(defaultFilters, activeTab === "trash");
  }, [fetchOrders, activeTab]);

  const debouncedFetch = useCallback((f: Filters) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchOrders(f, activeTab === "trash"), 400);
  }, [fetchOrders, activeTab]);

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    if (key === "orderStatus" || key === "paymentStatus" || key === "fromDate" || key === "toDate") {
      fetchOrders(next, activeTab === "trash");
    } else {
      debouncedFetch(next);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      fetchOrders(filters, activeTab === "trash");
    }
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    fetchOrders(defaultFilters, activeTab === "trash");
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/store/orders/${id}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchOrders(filters, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore");
    }
  };

  const handleTabChange = (tab: "orders" | "trash") => {
    setActiveTab(tab);
    fetchOrders(filters, tab === "trash");
  };

  const hasActiveFilters = Object.entries(filters).some(([key, val]) => {
    if (key === "orderStatus" || key === "paymentStatus") return val !== "all";
    return val !== "";
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Build active filter chips
  const activeChips: { label: string; key: keyof Filters }[] = [];
  if (filters.orderId) activeChips.push({ label: `Order ID: ${filters.orderId}`, key: "orderId" });
  if (filters.orderStatus !== "all") activeChips.push({ label: `Status: ${formatStatus(filters.orderStatus)}`, key: "orderStatus" });
  if (filters.paymentStatus !== "all") activeChips.push({ label: `Payment: ${formatStatus(filters.paymentStatus)}`, key: "paymentStatus" });
  if (filters.fromDate) activeChips.push({ label: `From: ${filters.fromDate}`, key: "fromDate" });
  if (filters.toDate) activeChips.push({ label: `To: ${filters.toDate}`, key: "toDate" });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">
            My Orders
          </h1>
          <p className="mt-1 text-[14px] text-[#6F6F69]">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
            {hasActiveFilters ? " (filtered)" : " total"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#FAFAF7] rounded-lg border border-[#E8E6DF]/50 p-0.5">
            <button
              onClick={() => handleTabChange("orders")}
              className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all cursor-pointer ${
                activeTab === "orders"
                  ? "bg-[#171717] text-white"
                  : "text-[#6F6F69] hover:text-[#171717]"
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => handleTabChange("trash")}
              className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all cursor-pointer ${
                activeTab === "trash"
                  ? "bg-[#171717] text-white"
                  : "text-[#6F6F69] hover:text-[#171717]"
              }`}
            >
              <Trash2 size={13} className="inline mr-1" />
              Trash
            </button>
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
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-[13px]">
          {error}
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5 mb-6">
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
            <div className="flex gap-2">
              <input
                type="date"
                placeholder="From"
                value={filters.fromDate}
                onChange={(e) => updateFilter("fromDate", e.target.value)}
                className="flex-1 h-10 px-3 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[13px] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
              />
              <input
                type="date"
                placeholder="To"
                value={filters.toDate}
                onChange={(e) => updateFilter("toDate", e.target.value)}
                className="flex-1 h-10 px-3 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[13px] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
              />
            </div>
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
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
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#96958D]" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-16 text-center">
          <Package size={40} className="text-[#D8CBB8] mx-auto mb-4" />
          <p className="text-[16px] font-medium text-[#171717] mb-1">
            {hasActiveFilters ? "No orders found matching your filters" : "No orders yet"}
          </p>
          <p className="text-[13px] text-[#96958D] mb-4">
            {hasActiveFilters ? "Try adjusting your search criteria." : "Place an order to see it here."}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="h-11 px-6 rounded-lg border border-[#E8E6DF] text-[13px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={() => router.push("/products")}
              className="h-11 px-6 rounded-lg bg-[#171717] text-white text-[13px] font-medium hover:bg-[#2a2a2a] transition-all cursor-pointer"
            >
              Browse Products
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => router.push(`/dashboard/orders/${order.id}`)}
              className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[15px] font-semibold text-[#171717]">
                    {order.orderNumber ||
                      `#${order.id.slice(-6).toUpperCase()}`}
                  </p>
                  <p className="text-[12px] text-[#96958D] mt-0.5">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {activeTab === "trash" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRestore(order.id); }}
                      className="flex items-center gap-1 h-8 px-3 rounded-lg border border-[#E8E6DF] text-[12px] font-medium text-[#6F6F69] hover:bg-green-50 hover:text-green-600 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      Restore
                    </button>
                  )}
                  <ChevronRight size={18} className="text-[#96958D] mt-1" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="text-[16px] font-semibold text-[#171717]">
                  \u20A8{order.totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${statusColors[order.paymentStatus] || "bg-gray-100 text-[#96958D]"}`}
                >
                  Payment: {formatStatus(order.paymentStatus)}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${statusColors[order.orderStatus] || "bg-gray-100 text-[#96958D]"}`}
                >
                  Order: {formatStatus(order.orderStatus)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
