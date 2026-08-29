"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

export default function AboutCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-20 md:py-32 px-10 md:px-16"
      style={{ background: "#FAFAF7" }}
    >
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2
            className="font-medium text-[#171717]"
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              lineHeight: "1.08",
              letterSpacing: "-0.035em",
            }}
          >
            Need a Reliable Linen Supplier?
          </h2>
          <p className="mt-5 text-[16px] md:text-[17px] text-[#6F6F69] leading-[1.65] max-w-xl mx-auto">
            Tell us what your business needs and how much you order.
            We&apos;ll help you find the right products and bulk pricing.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
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
            <a
              href="#"
              className="group inline-flex items-center justify-center gap-2.5 border border-[#D8CBB8] text-[#171717] px-8 h-[52px] rounded-full text-sm font-medium hover:bg-[#F7F4ED] transition-all duration-300 hover:-translate-y-[2px]"
            >
              Contact Us
              <ArrowRight
                size={15}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
