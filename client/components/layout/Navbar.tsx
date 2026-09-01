"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, ShoppingBag, Menu, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleMobileMenu } from "@/lib/store/uiSlice";
import { openAuthModal, closeProfileDropdown, toggleProfileDropdown } from "@/lib/store/uiSlice";
import { logout } from "@/lib/store/authSlice";
import { navigationLinks, siteContent } from "@/lib/data/content";

const heroRoutes = ["/", "/about", "/contact"];

export default function Navbar() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const cartCount = useAppSelector((state) => state.cart.totalQuantity);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const profileDropdownOpen = useAppSelector((state) => state.ui.profileDropdownOpen);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const isHero = heroRoutes.includes(pathname);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        dispatch(closeProfileDropdown());
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropdownOpen, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(closeProfileDropdown());
  };

  const isTransparent = isHero && !scrolled;

  const textColor = isTransparent ? "#ffffff" : "#171717";
  const navTextColor = isTransparent ? "rgba(255,255,255,0.8)" : "#6F6F69";
  const navHoverColor = isTransparent ? "#ffffff" : "#171717";

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50"
      style={{
        transition:
          "background-color 300ms ease, backdrop-filter 300ms ease, box-shadow 300ms ease, border-color 300ms ease",
        backgroundColor: isTransparent
          ? "transparent"
          : "rgba(250, 250, 247, 0.96)",
        backdropFilter: isTransparent ? "none" : "blur(16px)",
        WebkitBackdropFilter: isTransparent ? "none" : "blur(16px)",
        borderBottom: isTransparent
          ? "1px solid transparent"
          : "1px solid rgba(0,0,0,0.06)",
        boxShadow: isTransparent ? "none" : "0 1px 20px rgba(0,0,0,0.03)",
      }}
    >
      <nav className="max-w-[1440px] mx-auto px-10 md:px-16 h-[80px] flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight transition-colors duration-300"
          style={{ color: textColor }}
        >
          {siteContent.brand.name}
        </Link>

        {/* Desktop Nav — Center */}
        <ul className="hidden md:flex items-center gap-10">
          {navigationLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-[13px] font-medium tracking-[0.01em] uppercase transition-colors duration-300"
                style={{ color: navTextColor }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = navHoverColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = navTextColor;
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Icons */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Search"
            className="hidden md:flex w-10 h-10 items-center justify-center transition-colors duration-300 cursor-pointer"
            style={{ color: navTextColor }}
          >
            <Search size={20} strokeWidth={1.5} />
          </button>

          {/* Auth buttons / Profile */}
          {isAuthenticated ? (
            <>
              <button
                aria-label="Cart"
                className="relative w-10 h-10 flex items-center justify-center transition-colors duration-300 cursor-pointer"
                style={{ color: navTextColor }}
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-[18px] h-[18px] bg-[#171717] text-white text-[10px] font-semibold rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              {/* Profile dropdown */}
              <div ref={profileRef} className="relative">
                <button
                  aria-label="Account"
                  onClick={() => dispatch(toggleProfileDropdown())}
                  className="hidden md:flex w-10 h-10 items-center justify-center transition-colors duration-300 cursor-pointer"
                  style={{ color: navTextColor }}
                >
                  <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center text-[13px] font-medium">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#E8E6DF]/60 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-[#E8E6DF]/50">
                        <p className="text-[13px] font-medium text-[#171717]">{user?.username}</p>
                        <p className="text-[11px] text-[#96958D] truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => dispatch(closeProfileDropdown())}
                          className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#6F6F69] hover:bg-[#FAFAF7] hover:text-[#171717] transition-colors cursor-pointer"
                        >
                          <User size={16} strokeWidth={1.5} />
                          Profile
                        </Link>
                        <Link
                          href="/dashboard"
                          onClick={() => dispatch(closeProfileDropdown())}
                          className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#6F6F69] hover:bg-[#FAFAF7] hover:text-[#171717] transition-colors cursor-pointer"
                        >
                          <ShoppingBag size={16} strokeWidth={1.5} />
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-[#6F6F69] hover:bg-[#FAFAF7] hover:text-[#171717] transition-colors cursor-pointer"
                        >
                          <LogOut size={16} strokeWidth={1.5} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => dispatch(openAuthModal("login"))}
                className="hidden md:block text-[13px] font-medium tracking-wide transition-colors duration-300 px-4 py-2 cursor-pointer"
                style={{ color: navTextColor }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = navHoverColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = navTextColor;
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => dispatch(openAuthModal("signup"))}
                className="hidden md:block text-[13px] font-medium tracking-wide bg-[#171717] text-white px-5 py-2.5 rounded-lg hover:bg-[#2a2a2a] transition-all duration-300 cursor-pointer"
              >
                Join
              </button>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            aria-label="Menu"
            onClick={() => dispatch(toggleMobileMenu())}
            className="md:hidden w-10 h-10 flex items-center justify-center transition-colors duration-300 cursor-pointer"
            style={{ color: navTextColor }}
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </nav>
    </motion.header>
  );
}
