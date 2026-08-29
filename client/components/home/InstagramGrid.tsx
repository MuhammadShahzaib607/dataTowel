"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { siteContent } from "@/lib/data/content";

const { social } = siteContent;

export default function InstagramGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      className="py-20 md:py-32 px-10 md:px-16"
      style={{ background: "#FAFAF7" }}
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <p className="text-[11px] md:text-xs font-semibold tracking-[0.18em] uppercase text-[#96958D] mb-2">
            {social.handle}
          </p>
          <p className="text-[16px] text-[#6F6F69]">{social.tagline}</p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {social.images.map((src, i) => (
            <motion.div
              key={src}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                duration: 0.6,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`relative overflow-hidden rounded-xl ${
                i === 0 || i === 3 ? "aspect-square" : "aspect-[3/4]"
              }`}
            >
              <img
                src={src}
                alt={`Linen & Co. lifestyle ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700 ease-out"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
