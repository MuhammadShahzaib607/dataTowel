"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { openForcedAuthModal } from "@/lib/store/uiSlice";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * Reusable wrapper for protected pages.
 *
 * - While auth is initializing: clean loading spinner
 * - Not authenticated: forced login modal (no close button) + clean background
 * - Authenticated but not admin (when requireAdmin): unauthorized state
 * - Authenticated (and admin if required): render children
 *
 * Usage:
 *   <ProtectedRoute>
 *     <ProfileContent />
 *   </ProtectedRoute>
 *
 *   <ProtectedRoute requireAdmin>
 *     <AdminDashboard />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isInitialized, user } = useAppSelector(
    (state) => state.auth
  );
  const [hasOpenedModal, setHasOpenedModal] = useState(false);

  // Once initialized and not authenticated, open the FORCED login modal
  useEffect(() => {
    if (isInitialized && !isAuthenticated && !hasOpenedModal) {
      dispatch(openForcedAuthModal("login"));
      setHasOpenedModal(true);
    }
  }, [isInitialized, isAuthenticated, hasOpenedModal, dispatch]);

  // While auth is still initializing, show a clean loading state
  if (!isInitialized) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={24} className="animate-spin text-[#96958D]" />
      </main>
    );
  }

  // If authenticated, check admin requirement
  if (isAuthenticated) {
    // If admin is required but user is not admin — show unauthorized
    if (requireAdmin && !user?.isAdmin) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center max-w-sm mx-auto px-6">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-[20px] font-semibold text-[#171717] tracking-tight mb-2">
              Access Denied
            </h2>
            <p className="text-[14px] text-[#6F6F69] mb-6">
              You don&apos;t have permission to access this page. This area is restricted to administrators.
            </p>
            <button
              onClick={() => router.push("/")}
              className="h-11 px-6 rounded-lg bg-[#171717] text-white text-[13px] font-medium hover:bg-[#2a2a2a] transition-all cursor-pointer"
            >
              Go to Homepage
            </button>
          </div>
        </main>
      );
    }

    // Authenticated and meets role requirement — render content
    return <>{children}</>;
  }

  // Not authenticated — show clean background, modal is forced open
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <Loader2 size={20} className="animate-spin text-[#D8CBB8] mx-auto mb-3" />
        <p className="text-[13px] text-[#96958D]">
          Please sign in to continue
        </p>
      </div>
    </main>
  );
}
