"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, ShoppingBag, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleMobileMenu } from "@/lib/store/uiSlice";
import { navigationLinks, siteContent } from "@/lib/data/content";

const heroRoutes = ["/", "/about", "/contact"];

export default function Navbar() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const cartCount = useAppSelector((state) => state.cart.totalQuantity);
  const [scrolled, setScrolled] = useState(false);

  const isHero = heroRoutes.includes(pathname);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Default variant: always white bg, dark text
  // Hero variant: transparent at top → white on scroll
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
            className="hidden md:flex w-10 h-10 items-center justify-center transition-colors duration-300"
            style={{ color: navTextColor }}
          >
            <Search size={20} strokeWidth={1.5} />
          </button>
          <button
            aria-label="Account"
            className="hidden md:flex w-10 h-10 items-center justify-center transition-colors duration-300"
            style={{ color: navTextColor }}
          >
            <User size={20} strokeWidth={1.5} />
          </button>
          <button
            aria-label="Cart"
            className="relative w-10 h-10 flex items-center justify-center transition-colors duration-300"
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
          <button
            aria-label="Menu"
            onClick={() => dispatch(toggleMobileMenu())}
            className="md:hidden w-10 h-10 flex items-center justify-center transition-colors duration-300"
            style={{ color: navTextColor }}
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </nav>
    </motion.header>
  );
}
