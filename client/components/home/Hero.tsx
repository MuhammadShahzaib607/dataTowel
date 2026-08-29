"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { siteContent } from "@/lib/data/content";

const { hero } = siteContent;

export default function Hero() {
  return (
    <section className="relative h-[100svh] min-h-[600px] overflow-hidden">
      {/* Video Background — z-0 */}
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src="/videos/hero_video.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />

      {/* Subtle readability overlay — z-10 */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/30 via-black/10 to-transparent" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

      {/* Hero Content — z-20 */}
      <div className="relative z-20 h-full max-w-[1440px] mx-auto px-10 md:px-16 flex flex-col justify-end pb-16 md:pb-24">
        <div className="max-w-[700px]">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-[11px] md:text-xs font-semibold tracking-[0.16em] uppercase text-white/65 mb-5"
          >
            {hero.eyebrow}
          </motion.p>

          {/* Heading */}
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
            Wrapped in<br />Comfort.
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            className="text-[16px] md:text-[17px] text-white/70 max-w-[520px] leading-[1.65] mb-10"
          >
            {hero.subheading}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className="flex flex-wrap items-center gap-4"
          >
            {/* Primary Button */}
            <a
              href="#shop"
              className="group inline-flex items-center justify-center gap-2.5 bg-[#171717] text-white px-8 h-[52px] rounded-full text-sm font-medium hover:bg-[#2a2a2a] transition-all duration-300 hover:-translate-y-[2px]"
            >
              {hero.cta}
              <ArrowRight
                size={15}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
            {/* Secondary Button */}
            <a
              href="#about"
              className="group inline-flex items-center justify-center gap-2.5 border border-white/40 text-white px-8 h-[52px] rounded-full text-sm font-medium hover:bg-white/10 transition-all duration-300 hover:-translate-y-[2px]"
            >
              {hero.secondaryCta}
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
