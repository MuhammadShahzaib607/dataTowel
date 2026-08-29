"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";
import { siteContent } from "@/lib/data/content";

const { testimonials } = siteContent;

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-20 md:py-32 px-10 md:px-16"
      style={{ background: "#F7F4ED" }}
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Featured quote */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          <h2
            className="font-medium text-[#171717] italic"
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              lineHeight: "1.15",
              letterSpacing: "-0.03em",
            }}
          >
            &ldquo;{testimonials.items[0].quote}&rdquo;
          </h2>
          <div className="flex items-center justify-center gap-1 mt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                fill="currentColor"
                className="text-[#D8CBB8]"
              />
            ))}
          </div>
          <p className="mt-5 text-[14px] font-medium text-[#171717]">
            {testimonials.items[0].name}
          </p>
          <p className="text-[12px] text-[#96958D]">
            {testimonials.items[0].location}
          </p>
        </motion.div>

        {/* Other testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
          {testimonials.items.slice(1).map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.2 + i * 0.15,
              }}
              className="text-center md:text-left"
            >
              <div className="flex items-center justify-center md:justify-start gap-1 mb-4">
                {Array.from({ length: item.rating }).map((_, j) => (
                  <Star
                    key={j}
                    size={13}
                    fill="currentColor"
                    className="text-[#D8CBB8]"
                  />
                ))}
              </div>
              <p className="text-[16px] text-[#6F6F69] leading-[1.65] italic">
                &ldquo;{item.quote}&rdquo;
              </p>
              <p className="mt-4 text-[14px] font-medium text-[#171717]">
                {item.name}
              </p>
              <p className="text-[12px] text-[#96958D]">{item.location}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
