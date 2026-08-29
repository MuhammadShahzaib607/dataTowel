"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    number: "01",
    title: "Consistent Quality",
    description:
      "Products that meet the same standard order after order.",
  },
  {
    number: "02",
    title: "Bulk-Friendly Pricing",
    description:
      "Better pricing for businesses ordering in quantity.",
  },
  {
    number: "03",
    title: "Reliable Supply",
    description:
      "Products available when your business needs to replenish stock.",
  },
  {
    number: "04",
    title: "Built for Daily Use",
    description:
      "Textiles made for everyday commercial use.",
  },
];

export default function WhyContact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-20 md:py-32 px-10 md:px-16"
      style={{ background: "#FAFAF7" }}
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="max-w-2xl mb-14 md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[11px] md:text-xs font-semibold tracking-[0.18em] uppercase text-[#96958D] mb-4"
          >
            Why Businesses Contact Us
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
            A Supplier You Can Come Back To.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10">
          {features.map((feature, i) => (
            <motion.div
              key={feature.number}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.15 + i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <span className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-[#96958D] mb-3">
                {feature.number}
              </span>
              <h3 className="text-[16px] font-semibold text-[#171717] mb-2">
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
