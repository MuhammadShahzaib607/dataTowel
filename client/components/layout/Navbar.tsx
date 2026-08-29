"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, User, ShoppingBag, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleMobileMenu } from "@/lib/store/uiSlice";
import { navigationLinks, siteContent } from "@/lib/data/content";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector((state) => state.cart.totalQuantity);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50"
      style={{
        transition:
          "background-color 300ms ease, backdrop-filter 300ms ease, box-shadow 300ms ease, border-color 300ms ease",
        backgroundColor: scrolled
          ? "rgba(250, 250, 247, 0.96)"
          : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(0,0,0,0.06)"
          : "1px solid transparent",
        boxShadow: scrolled
          ? "0 1px 20px rgba(0,0,0,0.03)"
          : "none",
      }}
    >
      <nav className="max-w-[1440px] mx-auto px-10 md:px-16 h-[80px] flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight transition-colors duration-300"
          style={{ color: scrolled ? "#171717" : "#ffffff" }}
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
                style={{
                  color: scrolled ? "#6F6F69" : "rgba(255,255,255,0.8)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = scrolled
                    ? "#171717"
                    : "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = scrolled
                    ? "#6F6F69"
                    : "rgba(255,255,255,0.8)";
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
            className="hidden md:flex w-10 h-10 items-center justify-center transition-colors duration-300"
            style={{ color: scrolled ? "#6F6F69" : "rgba(255,255,255,0.8)" }}
          >
            <Search size={20} strokeWidth={1.5} />
          </button>
          <button
            aria-label="Account"
            className="hidden md:flex w-10 h-10 items-center justify-center transition-colors duration-300"
            style={{ color: scrolled ? "#6F6F69" : "rgba(255,255,255,0.8)" }}
          >
            <User size={20} strokeWidth={1.5} />
          </button>
          <button
            aria-label="Cart"
            className="relative w-10 h-10 flex items-center justify-center transition-colors duration-300"
            style={{ color: scrolled ? "#6F6F69" : "rgba(255,255,255,0.8)" }}
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
          <button
            aria-label="Menu"
            onClick={() => dispatch(toggleMobileMenu())}
            className="md:hidden w-10 h-10 flex items-center justify-center transition-colors duration-300"
            style={{ color: scrolled ? "#6F6F69" : "rgba(255,255,255,0.8)" }}
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </nav>
    </motion.header>
  );
}
