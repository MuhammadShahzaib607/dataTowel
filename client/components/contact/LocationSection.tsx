"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const cities = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Hyderabad",
  "Faisalabad",
  "Rawalpindi",
  "Multan",
  "Peshawar",
];

export default function LocationSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-20 md:py-32 px-10 md:px-16"
      style={{ background: "#FFFFFF" }}
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[11px] md:text-xs font-semibold tracking-[0.18em] uppercase text-[#96958D] mb-4"
          >
            Where We Supply
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-medium text-[#171717]"
            style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              lineHeight: "1.08",
              letterSpacing: "-0.035em",
            }}
          >
            Supplying Businesses Across Pakistan.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 text-[16px] md:text-[17px] text-[#6F6F69] leading-[1.65] max-w-xl mx-auto"
          >
            Based in Karachi, DataTowel supplies towels, bedsheets and
            linens to businesses across Pakistan.
          </motion.p>

          {/* City tags */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            {cities.map((city, i) => (
              <motion.span
                key={city}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.04 }}
                className="inline-flex items-center px-5 py-2.5 bg-[#FAFAF7] rounded-full border border-[#E8E6DF]/60 text-[13px] font-medium text-[#6F6F69]"
              >
                {city}
              </motion.span>
            ))}
          </motion.div>

          {/* Primary location */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-[#171717] rounded-full"
          >
            <span className="text-[13px] font-medium text-white">
              Primary Location: Karachi, Pakistan
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
