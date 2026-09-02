"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Newspaper, Settings, Menu, X, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { logout } from "@/lib/store/authSlice";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { siteContent } from "@/lib/data/content";

const sidebarLinks = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Blogs",
    href: "/admin/blogs",
    icon: Newspaper,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen flex bg-[#FAFAF7]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-[260px] bg-white border-r border-[#E8E6DF]/50 min-h-screen">
          {/* Logo */}
          <div className="h-[72px] flex items-center px-6 border-b border-[#E8E6DF]/50">
            <Link
              href="/"
              className="text-[16px] font-semibold tracking-tight text-[#171717]"
            >
              {siteContent.brand.name}
            </Link>
            <span className="ml-2 text-[10px] font-medium tracking-[0.1em] uppercase text-[#96958D] bg-[#F2EFE8] px-2 py-0.5 rounded">
              Admin
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-1">
              {sidebarLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(link.href + "/");
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#171717] text-white"
                          : "text-[#6F6F69] hover:bg-[#F2EFE8] hover:text-[#171717]"
                      }`}
                    >
                      <link.icon size={16} strokeWidth={1.5} />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="px-4 py-4 border-t border-[#E8E6DF]/50">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center text-[12px] font-medium">
                {(user?.firstName?.[0] || user?.username?.[0] || "A").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-[#171717] truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.username}
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
                      const isActive =
                        pathname === link.href ||
                        pathname.startsWith(link.href + "/");
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
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Mobile user section */}
                <div className="px-4 py-4 border-t border-[#E8E6DF]/50">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center text-[12px] font-medium">
                      {(user?.firstName?.[0] || user?.username?.[0] || "A").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[#171717] truncate">
                        {user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.username}
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
                Admin
              </span>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-6 lg:p-10">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
