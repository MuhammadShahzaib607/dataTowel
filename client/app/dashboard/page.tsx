"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

interface Order {
  id: string;
  orderNumber: string;
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

function DashboardContent() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { token } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/store/orders/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.paymentStatus === "pending" || o.paymentStatus === "submitted"
  ).length;
  const processingOrders = orders.filter(
    (o) => o.orderStatus === "processing"
  ).length;
  const deliveredOrders = orders.filter(
    (o) => o.orderStatus === "delivered"
  ).length;

  const recentOrders = orders.slice(0, 5);

  const formatStatus = (s?: string | null) => {
    if (!s) return "Unknown";
    return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: Package,
      bg: "bg-[#F2EFE8]",
    },
    {
      label: "Pending",
      value: pendingOrders,
      icon: Clock,
      bg: "bg-yellow-50",
    },
    {
      label: "Processing",
      value: processingOrders,
      icon: Truck,
      bg: "bg-blue-50",
    },
    {
      label: "Delivered",
      value: deliveredOrders,
      icon: CheckCircle,
      bg: "bg-green-50",
    },
  ];

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="mt-1 text-[14px] text-[#6F6F69]">
          Here&apos;s an overview of your account.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}
              >
                <stat.icon size={16} className="text-[#6F6F69]" />
              </div>
              <p className="text-[12px] text-[#96958D] font-medium">
                {stat.label}
              </p>
            </div>
            <p className="text-[28px] font-bold text-[#171717]">
              {loading ? "–" : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div
          onClick={() => router.push("/dashboard/orders")}
          className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-[#F2EFE8] flex items-center justify-center">
            <Package size={18} className="text-[#6F6F69]" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-medium text-[#171717]">
              My Orders
            </p>
            <p className="text-[12px] text-[#96958D]">
              View and track your orders
            </p>
          </div>
          <ChevronRight size={18} className="text-[#96958D]" />
        </div>

        <div
          onClick={() => router.push("/dashboard/profile")}
          className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-[#F2EFE8] flex items-center justify-center">
            <Package size={18} className="text-[#6F6F69]" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-medium text-[#171717]">Profile</p>
            <p className="text-[12px] text-[#96958D]">
              Manage your account details
            </p>
          </div>
          <ChevronRight size={18} className="text-[#96958D]" />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-[#E8E6DF]/50">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6DF]/50">
          <h2 className="text-[15px] font-semibold text-[#171717]">
            Recent Orders
          </h2>
          {orders.length > 0 && (
            <button
              onClick={() => router.push("/dashboard/orders")}
              className="text-[12px] font-medium text-[#6F6F69] hover:text-[#171717] cursor-pointer"
            >
              View All
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-[#D8CBB8] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingBag
              size={36}
              className="text-[#D8CBB8] mx-auto mb-3"
            />
            <p className="text-[14px] font-medium text-[#171717] mb-1">
              No orders yet
            </p>
            <p className="text-[13px] text-[#96958D] mb-5">
              Start shopping to see your orders here.
            </p>
            <button
              onClick={() => router.push("/products")}
              className="h-10 px-5 rounded-lg bg-[#171717] text-white text-[13px] font-medium hover:bg-[#2a2a2a] transition-all cursor-pointer"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div>
            {recentOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6DF]/30 last:border-0 cursor-pointer hover:bg-[#FAFAF7] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[#171717]">
                    {order.orderNumber ||
                      `#${order.id.slice(-6).toUpperCase()}`}
                  </p>
                  <p className="text-[12px] text-[#96958D] mt-0.5">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-[14px] font-semibold text-[#171717]">
                    ₨{order.totalAmount.toLocaleString()}
                  </span>
                  <span
                    className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[order.orderStatus] || "bg-gray-100 text-[#96958D]"}`}
                  >
                    {formatStatus(order.orderStatus)}
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-[#96958D] hidden sm:block"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserDashboardPage() {
  return <DashboardContent />;
}
