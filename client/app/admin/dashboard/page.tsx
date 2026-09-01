import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | DataTowel",
};

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">
          Admin Dashboard
        </h1>
        <p className="mt-1.5 text-[14px] text-[#6F6F69]">
          Welcome back. Here&apos;s an overview of your store.
        </p>
      </div>

      {/* Placeholder for future content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { label: "Total Users", value: "—" },
          { label: "Total Orders", value: "—" },
          { label: "Revenue", value: "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6"
          >
            <p className="text-[12px] font-medium text-[#96958D] uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="mt-2 text-[28px] font-semibold text-[#171717]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
