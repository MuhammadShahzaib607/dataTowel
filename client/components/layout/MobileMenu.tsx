"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { closeMobileMenu, openAuthModal } from "@/lib/store/uiSlice";
import { logout } from "@/lib/store/authSlice";
import { navigationLinks, siteContent } from "@/lib/data/content";

export default function MobileMenu() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.mobileMenuOpen);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(closeMobileMenu());
  };

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
                  className="w-10 h-10 flex items-center justify-center text-[#6F6F69] hover:text-[#171717] transition-colors cursor-pointer"
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

                {/* Mobile auth section */}
                <div className="mt-8 pt-6 border-t border-[#E8E6DF]/30">
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#171717] text-white flex items-center justify-center text-[15px] font-medium">
                          {user?.profileImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.profileImage}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{(user?.firstName?.[0] || user?.username?.[0] || "U").toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-[#171717]">{user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.username}</p>
                          <p className="text-[12px] text-[#96958D]">{user?.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Link
                          href="/profile"
                          onClick={() => dispatch(closeMobileMenu())}
                          className="flex items-center gap-2 text-[13px] text-[#6F6F69] hover:text-[#171717] transition-colors cursor-pointer"
                        >
                          <User size={16} strokeWidth={1.5} />
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 text-[13px] text-[#6F6F69] hover:text-[#171717] transition-colors cursor-pointer"
                        >
                          <LogOut size={16} strokeWidth={1.5} />
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          dispatch(closeMobileMenu());
                          dispatch(openAuthModal("login"));
                        }}
                        className="flex-1 h-11 rounded-lg border border-[#171717] text-[13px] font-medium text-[#171717] hover:bg-[#171717] hover:text-white transition-all cursor-pointer"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          dispatch(closeMobileMenu());
                          dispatch(openAuthModal("signup"));
                        }}
                        className="flex-1 h-11 rounded-lg bg-[#171717] text-white text-[13px] font-medium hover:bg-[#2a2a2a] transition-all cursor-pointer"
                      >
                        Join
                      </button>
                    </div>
                  )}
                </div>
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
