"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProfileForm from "@/components/profile/ProfileForm";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen pb-20">
        <div className="max-w-[640px] mx-auto px-6 md:px-10 pt-12">
          <ProfileForm />
        </div>
      </main>
    </ProtectedRoute>
  );
}
