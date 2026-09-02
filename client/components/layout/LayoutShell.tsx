"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Navbar from "./Navbar";
import MobileMenu from "./MobileMenu";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import AuthModal from "@/components/auth/AuthModal";
import AuthInitializer from "@/components/auth/AuthInitializer";
import CartHydrator from "@/components/auth/CartHydrator";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setIsPrivateRoute } from "@/lib/store/uiSlice";

// Routes that have their own layout (no public navbar/footer at all)
const ADMIN_PREFIXES = ["/admin"];

// User private routes — show navbar/footer only when authenticated
// /profile is NOT included because it should show the public navbar + footer
const USER_PRIVATE_PREFIXES = ["/dashboard"];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

interface LayoutShellProps {
  children: React.ReactNode;
}

export default function LayoutShell({ children }: LayoutShellProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isInitialized, isAuthenticated } = useAppSelector((state) => state.auth);

  const isAdminRoute = matchesPrefix(pathname, ADMIN_PREFIXES);
  const isUserPrivate = matchesPrefix(pathname, USER_PRIVATE_PREFIXES);
  const isPrivate = isAdminRoute || isUserPrivate;

  // Keep Redux in sync so other components can also check
  useEffect(() => {
    dispatch(setIsPrivateRoute(isPrivate));
  }, [isPrivate, dispatch]);

  // Determine whether to show navbar/footer
  let showNav = true;
  if (isAdminRoute) {
    // Admin routes never show public navbar/footer
    showNav = false;
  } else if (isUserPrivate) {
    // User dashboard routes: the dashboard layout handles its own sidebar
    // so we hide the public navbar/footer for these routes
    showNav = false;
  }

  return (
    <>
      <AuthInitializer />
      <CartHydrator />
      {showNav && <Navbar />}
      {showNav && <MobileMenu />}
      <AuthModal />
      {children}
      {showNav && <Footer />}
      {showNav && <WhatsAppButton />}
    </>
  );
}
