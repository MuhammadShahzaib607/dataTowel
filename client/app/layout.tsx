import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import Navbar from "@/components/layout/Navbar";
import MobileMenu from "@/components/layout/MobileMenu";
import Footer from "@/components/layout/Footer";
import AuthModal from "@/components/auth/AuthModal";
import AuthInitializer from "@/components/auth/AuthInitializer";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

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
}: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} antialiased`}>
      <body>
        <ReduxProvider>
          <AuthInitializer />
          <Navbar />
          <MobileMenu />
          <AuthModal />
          {children}
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}
