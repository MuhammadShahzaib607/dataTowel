"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Navbar from "./Navbar";
import MobileMenu from "./MobileMenu";
import Footer from "./Footer";
import AuthModal from "@/components/auth/AuthModal";
import AuthInitializer from "@/components/auth/AuthInitializer";
import { useAppDispatch } from "@/lib/hooks";
import { setIsPrivateRoute } from "@/lib/store/uiSlice";

// Add private route prefixes here as the app grows
const PRIVATE_ROUTE_PREFIXES = ["/admin", "/dashboard", "/profile"];

function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

interface LayoutShellProps {
  children: React.ReactNode;
}

export default function LayoutShell({ children }: LayoutShellProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isPrivate = isPrivateRoute(pathname);

  // Keep Redux in sync so other components can also check
  useEffect(() => {
    dispatch(setIsPrivateRoute(isPrivate));
  }, [isPrivate, dispatch]);

  return (
    <>
      <AuthInitializer />
      {!isPrivate && <Navbar />}
      {!isPrivate && <MobileMenu />}
      <AuthModal />
      {children}
      {!isPrivate && <Footer />}
    </>
  );
}
