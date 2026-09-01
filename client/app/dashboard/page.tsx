"use client";

import { Loader2 } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function DashboardContent() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <main className="min-h-screen pb-20">
      <div className="max-w-[640px] mx-auto px-6 md:px-10">
        <div className="pt-12 pb-8">
          <h1 className="text-[28px] font-semibold text-[#171717] tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1.5 text-[14px] text-[#6F6F69]">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}. This is your dashboard.
          </p>
        </div>

        {/* Placeholder for future content */}
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-8 text-center">
          <p className="text-[14px] text-[#96958D]">
            Your order history and account details will appear here.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function UserDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
