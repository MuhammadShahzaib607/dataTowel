import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Premium Towels & Everyday Comfort | Linen & Co.",
  description:
    "Thoughtfully crafted towels designed for everyday rituals. Premium cotton, timeless design, and exceptional softness. Discover the Linen & Co. collection.",
  openGraph: {
    title: "Premium Towels & Everyday Comfort | Linen & Co.",
    description:
      "Thoughtfully crafted towels designed for everyday rituals. Premium cotton, timeless design, and exceptional softness.",
    type: "website",
    locale: "en_US",
    siteName: "Linen & Co.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Towels & Everyday Comfort | Linen & Co.",
    description:
      "Thoughtfully crafted towels designed for everyday rituals.",
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} antialiased`}>
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
