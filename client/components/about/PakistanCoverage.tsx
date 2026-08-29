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

export default function PakistanCoverage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative py-20 md:py-32 overflow-hidden"
      style={{ background: "#F7F4ED" }}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/about-pakistan.png"
          alt="DataTowel textile products arranged in a premium setting"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(247,244,237,0.9) 0%, rgba(247,244,237,0.75) 50%, rgba(247,244,237,0.9) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-10 md:px-16">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
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
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-5 text-[16px] md:text-[17px] text-[#6F6F69] leading-[1.65] max-w-xl mx-auto"
          >
            From Karachi to Lahore, Islamabad, Hyderabad and beyond,
            DataTowel works with businesses that need reliable textile
            supply at scale.
          </motion.p>

          {/* City list */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-4"
          >
            {cities.map((city, i) => (
              <motion.span
                key={city}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.05 }}
                className="inline-flex items-center px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-full border border-[#E8E6DF] text-[13px] font-medium text-[#171717]"
              >
                {city}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
