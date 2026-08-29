"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { siteContent } from "@/lib/data/content";

const { editorial } = siteContent;

export default function EditorialSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden"
    >
      {/* Background Image */}
      <motion.div
        initial={{ scale: 1.05 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 w-full h-full"
      >
        <img
          src={editorial.image}
          alt="DataTowel premium cotton towels in a luxury setting"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ minHeight: "100%", minWidth: "100%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.05) 100%)",
          }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 h-full max-w-[1440px] mx-auto px-10 md:px-16 flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-xl"
        >
          {editorial.eyebrow && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[10px] md:text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60 mb-4"
            >
              {editorial.eyebrow}
            </motion.p>
          )}
          <h2
            className="font-medium text-white whitespace-pre-line"
            style={{
              fontSize: "clamp(36px, 5vw, 56px)",
              lineHeight: "1.02",
              letterSpacing: "-0.035em",
            }}
          >
            {editorial.heading}
          </h2>
          <p className="mt-5 text-[16px] md:text-[17px] text-white/75 leading-[1.65] max-w-md">
            {editorial.paragraph}
          </p>
          <a
            href="#shop"
            className="group inline-flex items-center justify-center gap-2.5 mt-8 bg-white/15 backdrop-blur-sm border border-white/25 text-white px-8 h-[52px] rounded-full text-sm font-medium hover:bg-white/25 transition-all duration-300 hover:-translate-y-[2px]"
          >
            {editorial.cta}
            <ArrowRight
              size={15}
              strokeWidth={2}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
