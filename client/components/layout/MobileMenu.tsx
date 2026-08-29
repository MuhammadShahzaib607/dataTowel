"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { closeMobileMenu } from "@/lib/store/uiSlice";
import { navigationLinks, siteContent } from "@/lib/data/content";

export default function MobileMenu() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.mobileMenuOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={() => dispatch(closeMobileMenu())}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 w-[80vw] max-w-sm bg-white z-50 shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-8 h-[88px] border-b border-[#E8E6DF]/50">
                <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#96958D]">
                  Menu
                </span>
                <button
                  aria-label="Close menu"
                  onClick={() => dispatch(closeMobileMenu())}
                  className="w-10 h-10 flex items-center justify-center text-[#6F6F69] hover:text-[#171717] transition-colors"
                >
                  <X size={22} strokeWidth={1.5} />
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 px-8 py-8">
                <ul>
                  {navigationLinks.map((link, i) => (
                    <motion.li
                      key={link.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.1 + i * 0.05,
                        duration: 0.4,
                      }}
                      className="border-b border-[#E8E6DF]/30"
                    >
                      <Link
                        href={link.href}
                        onClick={() => dispatch(closeMobileMenu())}
                        className="block py-5 text-[24px] font-light text-[#171717] hover:text-[#6F6F69] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* Footer */}
              <div className="px-8 py-6 border-t border-[#E8E6DF]/50">
                <p className="text-[11px] text-[#96958D] tracking-wider uppercase">
                  {siteContent.brand.name}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
