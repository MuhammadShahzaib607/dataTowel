"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Users,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import CustomDropdown from "@/components/admin/CustomDropdown";
import UserAvatar from "@/components/ui/UserAvatar";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  country: string;
  profileImage: string;
  isVerified: boolean;
  isAdmin: boolean;
  authProvider: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusFilterOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Verified", value: "active" },
  { label: "Unverified", value: "inactive" },
];

const sortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
];

export default function AdminUsersPage() {
  const { token } = useAppSelector((state) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userIdSearchQuery, setUserIdSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchUsers = useCallback(
    async (
      page: number,
      search: string,
      userIdSearch: string,
      status: string,
      sort: string
    ) => {
      if (!token) return;
      try {
        setLoading(true);
        setError("");
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "20");
        if (search.trim()) params.set("search", search.trim());
        if (userIdSearch.trim()) params.set("userId", userIdSearch.trim());
        if (status !== "all") params.set("status", status);
        if (sort) params.set("sort", sort);

        const res = await fetch(
          `${API_BASE_URL}/admin/users?${params.toString()}`,
          { headers: authHeaders }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setUsers(data.users || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchUsers(1, "", "", "all", "newest");
  }, [fetchUsers]);

  const debouncedFetch = useCallback(
    (search: string, userIdSearch: string, status: string, sort: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchUsers(1, search, userIdSearch, status, sort);
      }, 400);
    },
    [fetchUsers]
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedFetch(value, userIdSearchQuery, statusFilter, sortOrder);
  };

  const handleUserIdSearchChange = (value: string) => {
    setUserIdSearchQuery(value);
    debouncedFetch(searchQuery, value, statusFilter, sortOrder);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    fetchUsers(1, searchQuery, userIdSearchQuery, value, sortOrder);
  };

  const handleSortChange = (value: string) => {
    setSortOrder(value);
    fetchUsers(pagination.page, searchQuery, userIdSearchQuery, statusFilter, value);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchUsers(newPage, searchQuery, userIdSearchQuery, statusFilter, sortOrder);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getDisplayName = (user: User) => {
    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : user.username;
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedUser) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedUser]);

  // ESC to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedUser) {
        setSelectedUser(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedUser]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">
          Users
        </h1>
        <p className="mt-1.5 text-[14px] text-[#6F6F69]">
          Manage registered users
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-[13px] flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96958D]"
          />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-10 pl-8 pr-3 rounded-lg border border-[#E8E6DF] bg-white text-[13px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
          />
        </div>
        <div className="relative w-full sm:w-[220px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96958D]"
          />
          <input
            type="text"
            placeholder="Search by User ID..."
            value={userIdSearchQuery}
            onChange={(e) => handleUserIdSearchChange(e.target.value)}
            className="w-full h-10 pl-8 pr-3 rounded-lg border border-[#E8E6DF] bg-white text-[13px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
          />
        </div>
        <div className="w-full sm:w-[160px]">
          <CustomDropdown
            value={statusFilter}
            options={statusFilterOptions}
            placeholder="Status"
            onChange={handleStatusChange}
          />
        </div>
        <div className="w-full sm:w-[160px]">
          <CustomDropdown
            value={sortOrder}
            options={sortOptions}
            placeholder="Sort"
            onChange={handleSortChange}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        /* Skeleton Loader */
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 overflow-hidden">
          {/* Desktop skeleton */}
          <div className="hidden md:block">
            <div className="px-6 py-4 border-b border-[#E8E6DF]/50">
              <div className="h-4 w-32 bg-[#F2EFE8] rounded animate-pulse" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="px-6 py-4 border-b border-[#E8E6DF]/30 last:border-0 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-[#F2EFE8] animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-32 bg-[#F2EFE8] rounded animate-pulse" />
                  <div className="h-3 w-48 bg-[#F2EFE8] rounded animate-pulse" />
                </div>
                <div className="h-3 w-24 bg-[#F2EFE8] rounded animate-pulse hidden lg:block" />
                <div className="h-3 w-20 bg-[#F2EFE8] rounded animate-pulse hidden lg:block" />
                <div className="h-5 w-16 bg-[#F2EFE8] rounded-full animate-pulse" />
              </div>
            ))}
          </div>
          {/* Mobile skeleton */}
          <div className="md:hidden p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#FAFAF7] rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F2EFE8] animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-28 bg-[#F2EFE8] rounded animate-pulse" />
                    <div className="h-3 w-40 bg-[#F2EFE8] rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : users.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-16 text-center">
          <Users size={40} className="text-[#D8CBB8] mx-auto mb-4" />
          <p className="text-[16px] font-medium text-[#171717] mb-1">
            {searchQuery || userIdSearchQuery || statusFilter !== "all"
              ? "No users match your search."
              : "No users found."}
          </p>
          <p className="text-[13px] text-[#96958D]">
            {searchQuery || userIdSearchQuery || statusFilter !== "all"
              ? "Try adjusting your search criteria."
              : "Users will appear here once they register."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-[#E8E6DF]/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E6DF]/50">
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider hidden lg:table-cell">
                    Phone
                  </th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider hidden lg:table-cell">
                    Location
                  </th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[#E8E6DF]/30 last:border-0 hover:bg-[#FAFAF7] transition-colors cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={user.profileImage}
                          name={getDisplayName(user)}
                          username={user.username}
                          size="sm"
                        />
                        <div>
                          <p className="text-[13px] font-medium text-[#171717]">
                            {getDisplayName(user)}
                          </p>
                          <p className="text-[11px] text-[#96958D]">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] text-[#171717]">
                        {user.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <p className="text-[13px] text-[#171717]">
                        {user.phone || "\u2014"}
                      </p>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <p className="text-[13px] text-[#171717]">
                        {[user.city, user.country].filter(Boolean).join(", ") || "\u2014"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          user.isVerified
                            ? "bg-green-50 text-green-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {user.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl border border-[#E8E6DF]/50 p-4 cursor-pointer hover:bg-[#FAFAF7] transition-colors"
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      src={user.profileImage}
                      name={getDisplayName(user)}
                      username={user.username}
                      size="md"
                    />
                    <div>
                      <p className="text-[14px] font-medium text-[#171717]">
                        {getDisplayName(user)}
                      </p>
                      <p className="text-[12px] text-[#96958D]">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      user.isVerified
                        ? "bg-green-50 text-green-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {user.isVerified ? "Verified" : "Unverified"}
                  </span>
                </div>
                <p className="text-[13px] text-[#6F6F69] ml-[52px]">
                  {user.email}
                </p>
                {[user.city, user.country].filter(Boolean).length > 0 && (
                  <p className="text-[12px] text-[#96958D] ml-[52px] mt-1">
                    {[user.city, user.country].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-[12px] text-[#96958D]">
                Showing {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} users
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E8E6DF] text-[#6F6F69] hover:bg-[#FAFAF7] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                )
                  .filter((p) => {
                    if (pagination.totalPages <= 5) return true;
                    if (p === 1 || p === pagination.totalPages) return true;
                    if (Math.abs(p - pagination.page) <= 1) return true;
                    return false;
                  })
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="w-8 h-8 flex items-center justify-center text-[12px] text-[#96958D]"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p as number)}
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
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E8E6DF] text-[#6F6F69] hover:bg-[#FAFAF7] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setSelectedUser(null)}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            >
              <div
                className="w-full max-w-[560px] max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6DF]/50">
                  <h2 className="text-[16px] font-semibold text-[#171717]">
                    User Details
                  </h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6F6F69] hover:bg-[#F2EFE8] hover:text-[#171717] transition-colors cursor-pointer"
                  >
                    <X size={18} strokeWidth={1.5} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  {/* Profile Section */}
                  <div className="flex flex-col items-center mb-8">
                    <UserAvatar
                      src={selectedUser.profileImage}
                      name={getDisplayName(selectedUser)}
                      username={selectedUser.username}
                      size="xl"
                    />
                    <h3 className="mt-4 text-[18px] font-semibold text-[#171717]">
                      {getDisplayName(selectedUser)}
                    </h3>
                    <p className="text-[13px] text-[#96958D]">
                      @{selectedUser.username}
                    </p>
                    <p className="text-[13px] text-[#6F6F69] mt-1">
                      {selectedUser.email}
                    </p>
                  </div>

                  {/* Personal Information */}
                  <div className="mb-6">
                    <h4 className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-3">
                      Personal Information
                    </h4>
                    <div className="bg-[#FAFAF7] rounded-xl p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] text-[#96958D] mb-1">
                            First Name
                          </p>
                          <p className="text-[13px] text-[#171717]">
                            {selectedUser.firstName || "\u2014"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#96958D] mb-1">
                            Last Name
                          </p>
                          <p className="text-[13px] text-[#171717]">
                            {selectedUser.lastName || "\u2014"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#96958D] mb-1">
                          Phone
                        </p>
                        <p className="text-[13px] text-[#171717]">
                          {selectedUser.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mb-6">
                    <h4 className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-3">
                      Location
                    </h4>
                    <div className="bg-[#FAFAF7] rounded-xl p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] text-[#96958D] mb-1">
                            City
                          </p>
                          <p className="text-[13px] text-[#171717]">
                            {selectedUser.city || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#96958D] mb-1">
                            Country
                          </p>
                          <p className="text-[13px] text-[#171717]">
                            {selectedUser.country || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account */}
                  <div>
                    <h4 className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-3">
                      Account
                    </h4>
                    <div className="bg-[#FAFAF7] rounded-xl p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] text-[#96958D] mb-1">
                            Status
                          </p>
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              selectedUser.isVerified
                                ? "bg-green-50 text-green-700"
                                : "bg-yellow-50 text-yellow-700"
                            }`}
                          >
                            {selectedUser.isVerified ? "Verified" : "Unverified"}
                          </span>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#96958D] mb-1">
                            Auth Provider
                          </p>
                          <p className="text-[13px] text-[#171717] capitalize">
                            {selectedUser.authProvider}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] text-[#96958D] mb-1">
                            Joined
                          </p>
                          <p className="text-[13px] text-[#171717]">
                            {formatDate(selectedUser.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#96958D] mb-1">
                            Last Updated
                          </p>
                          <p className="text-[13px] text-[#171717]">
                            {selectedUser.updatedAt
                              ? formatDate(selectedUser.updatedAt)
                              : "\u2014"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
