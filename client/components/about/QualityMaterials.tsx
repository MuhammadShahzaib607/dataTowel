"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function QualityMaterials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="py-20 md:py-32 px-10 md:px-16"
      style={{ background: "#FAFAF7" }}
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 1.03 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/5] lg:aspect-[3/4] rounded-2xl overflow-hidden"
          >
            <img
              src="/images/about-quality.png"
              alt="DataTowel premium cotton fabric close-up showing quality fibers"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{
              duration: 0.8,
              delay: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="lg:pl-8"
          >
            <h2
              className="font-medium text-[#171717]"
              style={{
                fontSize: "clamp(32px, 4vw, 48px)",
                lineHeight: "1.08",
                letterSpacing: "-0.035em",
              }}
            >
              Quality You Can Feel.
            </h2>
            <p className="mt-6 text-[16px] md:text-[17px] text-[#6F6F69] leading-[1.65] max-w-lg">
              We focus on cotton quality, practical GSM weights and durable
              construction so our products perform beyond the first few
              washes.
            </p>
            <p className="mt-4 text-[16px] md:text-[17px] text-[#6F6F69] leading-[1.65] max-w-lg">
              For businesses, good linen isn&apos;t just about how it feels on
              day one. It needs to keep performing after repeated use.
            </p>
            <div className="mt-10 flex items-center gap-8">
              <div className="text-center">
                <span className="block text-[24px] font-semibold text-[#171717]">
                  100%
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#96958D]">
                  Cotton
                </span>
              </div>
              <div className="w-px h-10 bg-[#E8E6DF]" />
              <div className="text-center">
                <span className="block text-[24px] font-semibold text-[#171717]">
                  600
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#96958D]">
                  GSM
                </span>
              </div>
              <div className="w-px h-10 bg-[#E8E6DF]" />
              <div className="text-center">
                <span className="block text-[22px] font-semibold text-[#171717]">
                  OEKO-TEX
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#96958D]">
                  Certified
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
