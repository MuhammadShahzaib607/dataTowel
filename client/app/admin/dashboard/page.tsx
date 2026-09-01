"use client";

import { useState, useEffect } from "react";
import { Package, ShoppingCart, TrendingUp, Loader2 } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export default function AdminDashboardPage() {
  const { token } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    activeOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const [productsRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products`, { headers }),
          fetch(`${API_BASE_URL}/orders/stats`, { headers }),
        ]);

        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();

        const allProducts = productsData.products || [];
        setStats({
          totalProducts: allProducts.length,
          activeProducts: allProducts.filter((p: { isActive: boolean }) => p.isActive).length,
          totalOrders: ordersData.stats?.totalOrders || 0,
          activeOrders: ordersData.stats?.activeOrders || 0,
          totalRevenue: ordersData.stats?.totalRevenue || 0,
        });
      } catch {
        // Stats will show defaults
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

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
      value: `₨${stats.totalRevenue.toLocaleString()}`,
      sub: "from active orders",
      icon: TrendingUp,
    },
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
      )}
    </div>
  );
}
