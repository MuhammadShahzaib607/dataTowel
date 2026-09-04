"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  User,
  Menu,
  X,
  LogOut,
  Home,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { logout } from "@/lib/store/authSlice";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UserAvatar from "@/components/ui/UserAvatar";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { siteContent } from "@/lib/data/content";
import { onUnreadCountChange } from "@/lib/notificationEvents";

const sidebarLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Orders",
    href: "/dashboard/orders",
    icon: Package,
    exact: false,
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    exact: true,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
    exact: true,
  },
];

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Initialize collapsed state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("dashboard_sidebar_collapsed");
    if (stored === "true") setSidebarCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("dashboard_sidebar_collapsed", String(next));
      return next;
    });
  };

  // Fetch unread notification count and re-fetch on pathname change
  useEffect(() => {
    if (!token) return;
    const fetchCount = () => {
      fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => { if (data.success) setUnreadCount(data.count || 0); })
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [token, pathname]);

  // Listen for real-time unread count updates from notification pages
  useEffect(() => {
    const unsubscribe = onUnreadCountChange((count) => {
      setUnreadCount(count);
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const sidebarWidth = sidebarCollapsed ? "w-[72px]" : "w-[260px]";

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-[#FAFAF7]">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex flex-col ${sidebarWidth} bg-white border-r border-[#E8E6DF]/50 sticky top-0 h-screen transition-[width] duration-300 ease-in-out`}>
          {/* Logo */}
          <div className="h-[72px] flex items-center border-b border-[#E8E6DF]/50 transition-all duration-300">
            <div className={`flex items-center ${sidebarCollapsed ? "justify-center w-full px-2" : "px-6 w-full"}`}>
              <Link
                href="/"
                className="text-[16px] font-semibold tracking-tight text-[#171717] truncate"
              >
                {sidebarCollapsed
                  ? siteContent.brand.name.charAt(0)
                  : siteContent.brand.name}
              </Link>
              {!sidebarCollapsed && (
                <span className="ml-2 text-[10px] font-medium tracking-[0.1em] uppercase text-[#96958D] bg-[#F2EFE8] px-2 py-0.5 rounded">
                  Account
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 py-6 ${sidebarCollapsed ? "px-2" : "px-4"}`}>
            <ul className="space-y-1">
              {sidebarLinks.map((link) => {
                const isActive = link.exact
                  ? pathname === link.href
                  : pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      title={sidebarCollapsed ? link.label : undefined}
                      className={`flex items-center gap-3 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                        sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-4 py-2.5"
                      } ${
                        isActive
                          ? "bg-[#171717] text-white"
                          : "text-[#6F6F69] hover:bg-[#F2EFE8] hover:text-[#171717]"
                      }`}
                    >
                      <link.icon size={16} strokeWidth={1.5} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="truncate">{link.label}</span>}
                      {!sidebarCollapsed && link.href === "/dashboard/notifications" && unreadCount > 0 && (
                        <span className="ml-auto w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-semibold">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                      {sidebarCollapsed && link.href === "/dashboard/notifications" && unreadCount > 0 && (
                        <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Back to Store */}
          <div className={`${sidebarCollapsed ? "px-2" : "px-4"} mb-2`}>
            <Link
              href="/products"
              title={sidebarCollapsed ? "Back to Store" : undefined}
              className={`flex items-center gap-3 rounded-lg text-[13px] font-medium text-[#6F6F69] hover:bg-[#F2EFE8] hover:text-[#171717] transition-all cursor-pointer ${
                sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-4 py-2.5"
              }`}
            >
              <Home size={16} strokeWidth={1.5} className="flex-shrink-0" />
              {!sidebarCollapsed && "Back to Store"}
            </Link>
          </div>

          {/* Collapse Toggle Button */}
          <div className={`${sidebarCollapsed ? "px-2" : "px-4"} mb-2`}>
            <button
              onClick={toggleSidebar}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`flex items-center gap-3 rounded-lg text-[13px] font-medium text-[#6F6F69] hover:bg-[#F2EFE8] hover:text-[#171717] transition-all cursor-pointer ${
                sidebarCollapsed ? "justify-center px-2 py-2.5 w-full" : "px-4 py-2.5 w-full"
              }`}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen size={16} strokeWidth={1.5} className="flex-shrink-0" />
              ) : (
                <>
                  <PanelLeftClose size={16} strokeWidth={1.5} className="flex-shrink-0" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>

          {/* User section */}
          <div className={`${sidebarCollapsed ? "px-2" : "px-4"} py-4 border-t border-[#E8E6DF]/50`}>
            <div className={`flex items-center gap-3 py-2 ${sidebarCollapsed ? "justify-center px-0" : "px-4"}`}>
              <UserAvatar
                src={user?.profileImage}
                name={user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : undefined}
                username={user?.username}
                size="sm"
              />
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[#171717] truncate">
                    {user?.firstName
                      ? `${user.firstName} ${user.lastName || ""}`.trim()
                      : user?.username}
                  </p>
                  <p className="text-[11px] text-[#96958D] truncate">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              title={sidebarCollapsed ? "Logout" : undefined}
              className={`flex items-center gap-3 mt-1 rounded-lg text-[13px] text-[#6F6F69] hover:bg-[#F2EFE8] hover:text-[#171717] transition-colors cursor-pointer w-full ${
                sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-4 py-2.5"
              }`}
            >
              <LogOut size={15} strokeWidth={1.5} className="flex-shrink-0" />
              {!sidebarCollapsed && "Logout"}
            </button>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="fixed top-0 left-0 bottom-0 w-[260px] bg-white z-50 shadow-xl lg:hidden flex flex-col"
              >
                {/* Mobile sidebar header */}
                <div className="h-[72px] flex items-center justify-between px-6 border-b border-[#E8E6DF]/50">
                  <Link
                    href="/"
                    className="text-[16px] font-semibold tracking-tight text-[#171717]"
                  >
                    {siteContent.brand.name}
                  </Link>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="w-8 h-8 flex items-center justify-center text-[#6F6F69] hover:text-[#171717] cursor-pointer"
                  >
                    <X size={20} strokeWidth={1.5} />
                  </button>
                </div>

                {/* Mobile nav */}
                <nav className="flex-1 px-4 py-6">
                  <ul className="space-y-1">
                    {sidebarLinks.map((link) => {
                      const isActive = link.exact
                        ? pathname === link.href
                        : pathname === link.href || pathname.startsWith(link.href + "/");
                      return (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                              isActive
                                ? "bg-[#171717] text-white"
                                : "text-[#6F6F69] hover:bg-[#F2EFE8] hover:text-[#171717]"
                            }`}
                          >
                            <link.icon size={16} strokeWidth={1.5} />
                            {link.label}
                            {link.href === "/dashboard/notifications" && unreadCount > 0 && (
                              <span className="ml-auto w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-semibold">
                                {unreadCount > 99 ? "99+" : unreadCount}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-[#E8E6DF]/50">
                    <Link
                      href="/products"
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium text-[#6F6F69] hover:bg-[#F2EFE8] hover:text-[#171717] transition-all cursor-pointer"
                    >
                      <Home size={16} strokeWidth={1.5} />
                      Back to Store
                    </Link>
                  </div>
                </nav>

                {/* Mobile user section */}
                <div className="px-4 py-4 border-t border-[#E8E6DF]/50">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <UserAvatar
                      src={user?.profileImage}
                      name={user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : undefined}
                      username={user?.username}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[#171717] truncate">
                        {user?.firstName
                          ? `${user.firstName} ${user.lastName || ""}`.trim()
                          : user?.username}
                      </p>
                      <p className="text-[11px] text-[#96958D] truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 mt-1 rounded-lg text-[13px] text-[#6F6F69] hover:bg-[#F2EFE8] hover:text-[#171717] transition-colors cursor-pointer"
                  >
                    <LogOut size={15} strokeWidth={1.5} />
                    Logout
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top bar (mobile) */}
          <header className="lg:hidden h-[60px] flex items-center px-4 bg-white border-b border-[#E8E6DF]/50 sticky top-0 z-30">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-[#6F6F69] hover:text-[#171717] cursor-pointer"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
            <div className="flex items-center gap-2 ml-3">
              <span className="text-[15px] font-semibold text-[#171717]">
                {siteContent.brand.name}
              </span>
              <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#96958D] bg-[#F2EFE8] px-2 py-0.5 rounded">
                Account
              </span>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-6 lg:p-10">
            {children}
          </main>
        </div>
      </div>
      <WhatsAppButton />
    </ProtectedRoute>
  );
}
