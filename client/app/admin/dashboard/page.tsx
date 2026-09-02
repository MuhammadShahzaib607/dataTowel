"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Package, ShoppingCart, TrendingUp, Loader2, ChevronRight, Search } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import CustomDropdown from "@/components/admin/CustomDropdown";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

interface LatestOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
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

const formatStatus = (s?: string | null) => {
  if (!s) return "Unknown";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    activeOrders: 0,
    deliveredRevenue: 0,
  });
  const [latestOrders, setLatestOrders] = useState<LatestOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchStats = useCallback(async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/orders/stats`, { headers: authHeaders }),
      ]);

      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();

      const allProducts = productsData.products || [];
      setStats({
        totalProducts: allProducts.length,
        activeProducts: allProducts.filter((p: { isActive: boolean }) => p.isActive).length,
        totalOrders: ordersData.stats?.totalOrders || 0,
        activeOrders: ordersData.stats?.activeOrders || 0,
        deliveredRevenue: ordersData.stats?.deliveredRevenue || 0,
      });
      setLatestOrders(ordersData.stats?.latestOrders || []);
    } catch {
      // Stats will show defaults
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchFilteredOrders = useCallback(async (search: string, oStatus: string, pStatus: string) => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (oStatus !== "all") params.set("orderStatus", oStatus);
      if (pStatus !== "all") params.set("paymentStatus", pStatus);
      params.set("limit", "6");
      const qs = params.toString();
      const url = qs ? `${API_BASE_URL}/orders?${qs}` : `${API_BASE_URL}/orders?limit=6`;
      const res = await fetch(url, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) {
        setLatestOrders(data.orders || []);
      }
    } catch {
      // keep current orders
    }
  }, [token]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchFilteredOrders(value, orderFilter, paymentFilter);
    }, 400);
  };

  const handleOrderStatusChange = (value: string) => {
    setOrderFilter(value);
    fetchFilteredOrders(searchQuery, value, paymentFilter);
  };

  const handlePaymentStatusChange = (value: string) => {
    setPaymentFilter(value);
    fetchFilteredOrders(searchQuery, orderFilter, value);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const statCards = [
    {
      label: "Total Products",
      value: stats.totalProducts,
      sub: `${stats.activeProducts} active`,
      icon: Package,
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      sub: `${stats.activeOrders} active`,
      icon: ShoppingCart,
    },
    {
      label: "Revenue",
      value: `\u20A8${stats.deliveredRevenue.toLocaleString()}`,
      sub: "from delivered orders",
      icon: TrendingUp,
    },
  ];

  const hasFilters = searchQuery.trim() || orderFilter !== "all" || paymentFilter !== "all";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">
          Admin Dashboard
        </h1>
        <p className="mt-1.5 text-[14px] text-[#6F6F69]">
          Welcome back. Here&apos;s an overview of your store.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#96958D]" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[12px] font-medium text-[#96958D] uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <stat.icon size={18} className="text-[#D8CBB8]" strokeWidth={1.5} />
                </div>
                <p className="text-[28px] font-semibold text-[#171717]">
                  {stat.value}
                </p>
                <p className="mt-1 text-[12px] text-[#96958D]">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Latest Orders */}
          <div className="bg-white rounded-xl border border-[#E8E6DF]/50">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6DF]/50">
              <h2 className="text-[15px] font-semibold text-[#171717]">
                Latest Orders
              </h2>
              <button
                onClick={() => router.push("/admin/orders")}
                className="flex items-center gap-1 text-[12px] font-medium text-[#6F6F69] hover:text-[#171717] cursor-pointer transition-colors"
              >
                View All
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Compact Filter Bar */}
            <div className="px-6 py-3 border-b border-[#E8E6DF]/30 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96958D]" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full h-9 pl-8 pr-3 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[12px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
                />
              </div>
              <div className="w-full sm:w-[160px]">
                <CustomDropdown
                  value={orderFilter}
                  options={orderStatusFilterOptions}
                  placeholder="Status"
                  onChange={handleOrderStatusChange}
                />
              </div>
              <div className="w-full sm:w-[160px]">
                <CustomDropdown
                  value={paymentFilter}
                  options={paymentStatusFilterOptions}
                  placeholder="Payment"
                  onChange={handlePaymentStatusChange}
                />
              </div>
              {hasFilters && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setOrderFilter("all");
                    setPaymentFilter("all");
                    fetchStats();
                  }}
                  className="h-9 px-3 rounded-lg border border-[#E8E6DF] text-[12px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer whitespace-nowrap"
                >
                  Clear
                </button>
              )}
            </div>

            {latestOrders.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingCart size={32} className="text-[#D8CBB8] mx-auto mb-3" />
                <p className="text-[14px] text-[#96958D]">
                  {hasFilters ? "No orders found matching your filters." : "No orders yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E8E6DF]/50">
                      <th className="text-left px-6 py-3 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">Order</th>
                      <th className="text-left px-6 py-3 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">Customer</th>
                      <th className="text-left px-6 py-3 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">Total</th>
                      <th className="text-left px-6 py-3 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">Payment</th>
                      <th className="text-left px-6 py-3 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-3 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-[#E8E6DF]/30 last:border-0 hover:bg-[#FAFAF7] transition-colors cursor-pointer"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                      >
                        <td className="px-6 py-3">
                          <p className="text-[13px] font-medium text-[#171717]">{order.orderNumber || order.id.slice(0, 8)}</p>
                        </td>
                        <td className="px-6 py-3">
                          <p className="text-[13px] text-[#171717]">{order.customerName || "\u2013"}</p>
                        </td>
                        <td className="px-6 py-3">
                          <p className="text-[13px] font-medium text-[#171717]">\u20A8{order.totalAmount.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[order.paymentStatus] || ""}`}>
                            {formatStatus(order.paymentStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[order.orderStatus] || ""}`}>
                            {formatStatus(order.orderStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <p className="text-[12px] text-[#96958D]">{formatDate(order.createdAt)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
