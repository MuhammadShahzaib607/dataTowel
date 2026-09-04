"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  X,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

interface Notification {
  id: string;
  type: string;
  message: string;
  userId: string;
  userName: string;
  orderId: string;
  orderNumber: string;
  isRead: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchNotifications = useCallback(
    async (page: number) => {
      if (!token) return;
      try {
        setLoading(true);
        setError("");
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "20");

        const res = await fetch(
          `${API_BASE_URL}/admin/notifications?${params.toString()}`,
          { headers: authHeaders }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setNotifications(data.notifications || []);
        setPagination(
          data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load notifications"
        );
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const handleCopy = async (text: string, fieldKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/admin/notifications/read-all`, {
        method: "PATCH",
        headers: authHeaders,
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const formatTime = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">
            Notifications
          </h1>
          <p className="mt-1.5 text-[14px] text-[#6F6F69]">
            {pagination.total} notification{pagination.total !== 1 ? "s" : ""}
          </p>
        </div>
        {hasUnread && (
          <button
            onClick={handleMarkAllRead}
            className="h-9 px-4 rounded-lg border border-[#E8E6DF] text-[13px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-[13px] flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchNotifications(pagination.page)}
            className="cursor-pointer text-red-600 font-medium hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        /* Skeleton */
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F2EFE8] animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-[#F2EFE8] rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-[#F2EFE8] rounded animate-pulse" />
                  <div className="h-3 w-1/3 bg-[#F2EFE8] rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-16 text-center">
          <Bell size={40} className="text-[#D8CBB8] mx-auto mb-4" />
          <p className="text-[16px] font-medium text-[#171717] mb-1">
            No notifications yet
          </p>
          <p className="text-[13px] text-[#96958D]">
            Notifications will appear here when new orders are placed.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl border border-[#E8E6DF]/50 p-5 transition-colors ${
                !notification.isRead ? "border-l-2 border-l-[#171717]" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-[#F2EFE8] flex items-center justify-center flex-shrink-0">
                  <Bell size={16} className="text-[#6F6F69]" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#171717] leading-relaxed">
                    {notification.message}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[#96958D]">
                    <span>{formatTime(notification.createdAt)}</span>

                    {/* User ID */}
                    <button
                      onClick={() =>
                        handleCopy(
                          String(notification.userId),
                          `uid-${notification.id}`
                        )
                      }
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAFAF7] border border-[#E8E6DF]/50 hover:bg-[#F2EFE8] transition-colors cursor-pointer"
                    >
                      {copiedField === `uid-${notification.id}` ? (
                        <>
                          <Check size={10} className="text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={10} />
                          <span>Copy User ID</span>
                        </>
                      )}
                    </button>

                    {/* Order ID */}
                    <button
                      onClick={() =>
                        handleCopy(
                          String(notification.orderId),
                          `oid-${notification.id}`
                        )
                      }
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAFAF7] border border-[#E8E6DF]/50 hover:bg-[#F2EFE8] transition-colors cursor-pointer"
                    >
                      {copiedField === `oid-${notification.id}` ? (
                        <>
                          <Check size={10} className="text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={10} />
                          <span>Copy Order ID</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* View Order Button */}
                <button
                  onClick={() =>
                    router.push(`/admin/orders/${notification.orderId}`)
                  }
                  className="flex-shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#171717] text-white text-[12px] font-medium hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                >
                  <ExternalLink size={12} />
                  <span className="hidden sm:inline">View Order</span>
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-1 pt-4">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (pagination.totalPages <= 5) return true;
                  if (p === 1 || p === pagination.totalPages) return true;
                  if (Math.abs(p - pagination.page) <= 1) return true;
                  return false;
                })
                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span
                      key={`e-${i}`}
                      className="w-8 h-8 flex items-center justify-center text-[12px] text-[#96958D]"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => fetchNotifications(p as number)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                        pagination.page === p
                          ? "bg-[#171717] text-white"
                          : "border border-[#E8E6DF] text-[#6F6F69] hover:bg-[#FAFAF7]"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
