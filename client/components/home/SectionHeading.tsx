"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  align?: "left" | "center";
  headingClassName?: string;
}

export default function SectionHeading({
  eyebrow,
  heading,
  subheading,
  align = "center",
  headingClassName = "",
}: SectionHeadingProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div
      ref={ref}
      className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      {eyebrow && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-[11px] md:text-xs font-semibold tracking-[0.18em] uppercase text-[#96958D] mb-4"
        >
          {eyebrow}
        </motion.p>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-medium text-[#171717]"
        style={{
          fontSize: "clamp(32px, 4vw, 52px)",
          lineHeight: "1.08",
          letterSpacing: "-0.035em",
        }}
      >
        {heading}
      </motion.h2>
      {subheading && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 text-[16px] text-[#6F6F69] leading-[1.65]"
        >
          {subheading}
        </motion.p>
      )}
    </div>
  );
}
