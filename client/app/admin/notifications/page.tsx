"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bell,
  Copy,
  Check,
  ExternalLink,
  X,
  Search,
  CheckCheck,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { dispatchUnreadCountChange } from "@/lib/notificationEvents";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  userId: string;
  orderId: string;
  reason: string;
  link: string;
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
    page: 1, limit: 20, total: 0, totalPages: 0,
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"unread" | "all">("unread");
  const [unreadCount, setUnreadCount] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/notifications/unread-count`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (res.ok) setUnreadCount(data.count || 0);
    } catch {
      // ignore
    }
  }, [token]);

  const fetchNotifications = useCallback(
    async (page: number, userId?: string, tab?: "unread" | "all") => {
      if (!token) return;
      try {
        setLoading(true);
        setError("");
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "20");
        const currentTab = tab || activeTab;
        if (currentTab === "unread") params.set("isRead", "false");
        if (userId && userId.trim()) params.set("userId", userId.trim());

        const res = await fetch(
          `${API_BASE_URL}/admin/notifications?${params.toString()}`,
          { headers: authHeaders }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setNotifications(data.notifications || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    },
    [token, activeTab]
  );

  useEffect(() => {
    fetchNotifications(1);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const handleTabChange = (tab: "unread" | "all") => {
    setActiveTab(tab);
    fetchNotifications(1, userIdFilter, tab);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/notifications/${id}/read`, {
        method: "PATCH",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      const newCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newCount);
      dispatchUnreadCountChange(newCount);
      if (activeTab === "unread" && notifications.length === 1 && pagination.page > 1) {
        fetchNotifications(pagination.page - 1, userIdFilter, "unread");
      }
    } catch {
      // silently fail
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/notifications/read-all`, {
        method: "PATCH",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Failed to mark all as read");
      setNotifications([]);
      setUnreadCount(0);
      dispatchUnreadCountChange(0);
    } catch {
      // silently fail
    }
  };

  const handleUserIdSearch = (value: string) => {
    setUserIdFilter(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchNotifications(1, value), 400);
  };

  const clearUserIdFilter = () => {
    setUserIdFilter("");
    fetchNotifications(1, "");
  };

  const handleCopy = async (text: string, fieldKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleViewOrder = (notification: Notification) => {
    if (notification.link) {
      router.push(notification.link);
    } else {
      router.push(`/admin/orders/${notification.orderId}`);
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
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">Notifications</h1>
        <p className="mt-1.5 text-[14px] text-[#6F6F69]">
          {unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
            : "All caught up"}
        </p>
      </div>

      {/* Tabs + Mark All as Read */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 bg-[#FAFAF7] rounded-lg border border-[#E8E6DF]/50 p-0.5">
          <button
            onClick={() => handleTabChange("unread")}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all cursor-pointer ${
              activeTab === "unread"
                ? "bg-[#171717] text-white"
                : "text-[#6F6F69] hover:text-[#171717]"
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange("all")}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-[#171717] text-white"
                : "text-[#6F6F69] hover:text-[#171717]"
            }`}
          >
            All
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 h-9 px-4 rounded-lg border border-[#E8E6DF] text-[13px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer"
          >
            <CheckCheck size={14} />
            Mark all as read
          </button>
        )}
      </div>

      {/* User ID Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96958D]" />
            <input
              type="text"
              placeholder="Search by User ID..."
              value={userIdFilter}
              onChange={(e) => handleUserIdSearch(e.target.value)}
              className="w-full h-10 pl-8 pr-3 rounded-lg border border-[#E8E6DF] bg-white text-[13px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
            />
          </div>
          {userIdFilter && (
            <button
              onClick={clearUserIdFilter}
              className="h-10 px-3 rounded-lg border border-[#E8E6DF] text-[13px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-[13px] flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchNotifications(pagination.page)} className="cursor-pointer text-red-600 font-medium hover:underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E8E6DF]/50 p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F2EFE8] animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-[#F2EFE8] rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-[#F2EFE8] rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-[#F2EFE8] rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-16 text-center">
          <Bell size={40} className="text-[#D8CBB8] mx-auto mb-4" />
          <p className="text-[16px] font-medium text-[#171717] mb-1">
            {activeTab === "unread" ? "No unread notifications" : "No notifications yet"}
          </p>
          <p className="text-[13px] text-[#96958D]">
            {activeTab === "unread"
              ? "You're all caught up!"
              : "Notifications will appear here when activity occurs."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-xl border border-[#E8E6DF]/50 p-5 transition-colors ${
                !n.isRead ? "border-l-2 border-l-[#171717]" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  !n.isRead ? "bg-[#171717]" : "bg-[#F2EFE8]"
                }`}>
                  <Bell size={16} className={!n.isRead ? "text-white" : "text-[#6F6F69]"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-[13px] font-medium ${!n.isRead ? "text-[#171717]" : "text-[#6F6F69]"}`}>
                      {n.title}
                    </p>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#171717]" />}
                  </div>
                  <p className="text-[13px] text-[#6F6F69] leading-relaxed">{n.message}</p>
                  {n.reason && (
                    <p className="text-[12px] text-[#96958D] mt-1 italic">Reason: {n.reason}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[#96958D]">
                    <span>{formatTime(n.createdAt)}</span>
                    <button
                      onClick={() => handleCopy(String(n.userId), `uid-${n.id}`)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAFAF7] border border-[#E8E6DF]/50 hover:bg-[#F2EFE8] transition-colors cursor-pointer"
                    >
                      {copiedField === `uid-${n.id}` ? (
                        <><Check size={10} className="text-green-600" /><span className="text-green-600">Copied!</span></>
                      ) : (
                        <><Copy size={10} /><span>Copy User ID</span></>
                      )}
                    </button>
                    <button
                      onClick={() => handleCopy(String(n.orderId), `oid-${n.id}`)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAFAF7] border border-[#E8E6DF]/50 hover:bg-[#F2EFE8] transition-colors cursor-pointer"
                    >
                      {copiedField === `oid-${n.id}` ? (
                        <><Check size={10} className="text-green-600" /><span className="text-green-600">Copied!</span></>
                      ) : (
                        <><Copy size={10} /><span>Copy Order ID</span></>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  <button
                    onClick={() => handleViewOrder(n)}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#171717] text-white text-[12px] font-medium hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                  >
                    <ExternalLink size={12} />
                    <span className="hidden sm:inline">View Order</span>
                  </button>
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="flex items-center gap-1 h-7 px-2.5 rounded-lg border border-[#E8E6DF] text-[11px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-colors cursor-pointer"
                    >
                      <Check size={10} />
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
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
                    <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-[12px] text-[#96958D]">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => fetchNotifications(p as number, userIdFilter)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                        pagination.page === p ? "bg-[#171717] text-white" : "border border-[#E8E6DF] text-[#6F6F69] hover:bg-[#FAFAF7]"
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
