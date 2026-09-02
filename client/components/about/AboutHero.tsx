"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function AboutHero() {
  return (
    <section className="relative h-[100svh] min-h-[600px] overflow-hidden">
      {/* Background image */}
      <img
        src="/images/about-hero.png"
        alt="DataTowel premium cotton towels and bedsheets in a luxury setting"
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />

      {/* Dark gradient overlay — left-side heavy for text contrast */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(100deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 40%, rgba(0,0,0,0.10) 70%, transparent 100%)",
        }}
      />
      {/* Bottom gradient for depth */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

      {/* Hero Content — z-20, same positioning as Home Hero */}
      <div className="relative z-20 h-full max-w-[1440px] mx-auto px-10 md:px-16 flex flex-col justify-end pb-24 md:pb-36">
        <div className="max-w-[700px]">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-[11px] md:text-xs font-semibold tracking-[0.16em] uppercase text-white/65 mb-5"
          >
            About DataTowel
          </motion.p>

          {/* Heading — same font/weight as Home Hero */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-medium text-white mb-6"
            style={{
              fontSize: "clamp(52px, 7vw, 104px)",
              lineHeight: "0.95",
              letterSpacing: "-0.055em",
            }}
          >
            Trusted for
            <br />
            Every Order.
          </motion.h1>

          {/* Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            className="text-[16px] md:text-[17px] text-white/70 max-w-[520px] leading-[1.65] mb-10"
          >
            We supply premium cotton towels, bedsheets and linens to businesses
            across Pakistan, with consistent quality, reliable supply and
            pricing that makes sense for bulk orders.
          </motion.p>

          {/* CTAs — same button styles as Home Hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className="flex flex-wrap items-center gap-4"
          >
            {/* Primary Button */}
            <a
              href="#contact"
              className="group inline-flex items-center justify-center gap-2.5 bg-[#171717] text-white px-8 h-[52px] rounded-full text-sm font-medium hover:bg-[#2a2a2a] transition-all duration-300 hover:-translate-y-[2px]"
            >
              Request a Bulk Quote
              <ArrowRight
                size={15}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
            {/* Secondary Button */}
            <a
              href="/#shop"
              className="group inline-flex items-center justify-center gap-2.5 border border-white/40 text-white px-8 h-[52px] rounded-full text-sm font-medium hover:bg-white/10 transition-all duration-300 hover:-translate-y-[2px]"
            >
              Explore Our Products
              <ArrowRight
                size={15}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
