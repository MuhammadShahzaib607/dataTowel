"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { siteContent } from "@/lib/data/content";

const { intro } = siteContent;

export default function Introduction() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="py-28 md:pt-40 px-10 md:px-16"
      style={{ background: "#FAFAF7" }}
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-medium text-[#171717] whitespace-pre-line"
            style={{
              fontSize: "clamp(40px, 6vw, 80px)",
              lineHeight: "1.05",
              letterSpacing: "-0.045em",
            }}
          >
            {intro.heading}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.7,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-8 text-[17px] text-[#6F6F69] leading-[1.7] max-w-xl mx-auto"
          >
            {intro.paragraph}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
