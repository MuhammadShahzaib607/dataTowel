"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { siteContent } from "@/lib/data/content";

const { video: videoContent } = siteContent;

export default function VideoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative w-full min-h-[100svh] md:min-h-screen overflow-hidden"
      style={{ background: "#1a1816" }}
    >
      {/* Video — full bleed */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={videoContent.poster}
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={videoContent.src} type="video/mp4" />
      </video>

      {/* Subtle gradient for text readability — left-heavy, keeps video visible */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(100deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.12) 40%, transparent 70%)",
        }}
      />

      {/* Content overlay — left side, vertically centered */}
      <div className="relative z-10 h-full min-h-[100svh] md:min-h-screen flex items-center">
        <div className="w-full max-w-[1440px] mx-auto px-8 sm:px-10 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[560px]"
          >
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-[10px] md:text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60 mb-5 md:mb-6"
            >
              {videoContent.eyebrow}
            </motion.p>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="font-normal text-white"
              style={{
                fontSize: "clamp(40px, 6vw, 72px)",
                lineHeight: "1.0",
                letterSpacing: "-0.03em",
              }}
            >
              Softness You
              <br />
              Can Feel.
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mt-5 md:mt-6 text-[15px] md:text-[17px] text-white/65 leading-[1.65] max-w-[440px]"
            >
              Premium towels and home textiles crafted with exceptional
              softness, lasting quality and timeless simplicity.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="mt-8 md:mt-10 flex flex-wrap items-center gap-3 md:gap-4"
            >
              <a
                href="#shop"
                className="group inline-flex items-center gap-2 bg-white text-[#171717] px-7 h-[48px] rounded-[8px] text-[13px] font-medium hover:bg-white/90 transition-all duration-300 hover:-translate-y-[1px]"
              >
                Explore Collection
                <ArrowRight
                  size={14}
                  strokeWidth={2}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </a>
              <a
                href="#about"
                className="group inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-7 h-[48px] rounded-[8px] text-[13px] font-medium hover:bg-white/15 transition-all duration-300 hover:-translate-y-[1px]"
              >
                Our Story
                <ArrowRight
                  size={14}
                  strokeWidth={2}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
