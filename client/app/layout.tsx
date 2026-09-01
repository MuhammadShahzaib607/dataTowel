import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import LayoutShell from "@/components/layout/LayoutShell";

export const metadata: Metadata = {
  title: "DataTowel | Premium Towels, Bedsheets & Bulk Linen Supply in Pakistan",
  description:
    "DataTowel supplies premium cotton towels, bedsheets and linens in bulk to hotels, restaurants, gyms, spas, guesthouses, hospitals and retailers across Pakistan.",
  openGraph: {
    title: "DataTowel | Premium Towels, Bedsheets & Bulk Linen Supply in Pakistan",
    description:
      "Premium cotton towels, bedsheets and linens supplied in bulk to hotels, restaurants, gyms and retailers across Pakistan.",
    type: "website",
    locale: "en_US",
    siteName: "DataTowel",
  },
  twitter: {
    card: "summary_large_image",
    title: "DataTowel | Premium Towels, Bedsheets & Bulk Linen Supply in Pakistan",
    description:
      "Premium cotton towels, bedsheets and linens supplied in bulk across Pakistan.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <body>
        <ReduxProvider>
          <LayoutShell>{children}</LayoutShell>
        </ReduxProvider>
      </body>
    </html>
  );
}
