"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    number: "01",
    title: "Consistent Quality",
    description: "Every order should meet the same standard.",
  },
  {
    number: "02",
    title: "Bulk-Friendly Pricing",
    description: "Better pricing for businesses ordering in quantity.",
  },
  {
    number: "03",
    title: "Reliable Supply",
    description: "Products available when your business needs them.",
  },
  {
    number: "04",
    title: "Built for Daily Use",
    description:
      "Designed to handle repeated commercial washing and everyday use.",
  },
];

export default function WhyDataTowel() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-20 md:py-32 px-10 md:px-16"
      style={{ background: "#F7F4ED" }}
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-14 md:mb-20">
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
            Why Businesses Choose DataTowel.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
          {features.map((feature, i) => (
            <motion.div
              key={feature.number}
              initial={{ opacity: 0, y: 25 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-center md:text-left"
            >
              <span className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-[#96958D] mb-3">
                {feature.number}
              </span>
              <h3 className="text-[17px] font-semibold text-[#171717] mb-2">
                {feature.title}
              </h3>
              <p className="text-[14px] text-[#6F6F69] leading-[1.65]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
