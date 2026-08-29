"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { siteContent } from "@/lib/data/content";

const { brandStory } = siteContent;

export default function BrandStory() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      id="about"
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
            className="relative aspect-[4/5] lg:aspect-[3/4] rounded-2xl overflow-hidden order-2 lg:order-1"
          >
            <img
              src={brandStory.image}
              alt="DataTowel brand story — premium cotton textiles"
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
            className="order-1 lg:order-2 lg:pl-8"
          >
            <h2
              className="font-medium text-[#171717]"
              style={{
                fontSize: "clamp(32px, 4vw, 52px)",
                lineHeight: "1.08",
                letterSpacing: "-0.035em",
              }}
            >
              {brandStory.heading}
            </h2>
            <p className="mt-6 text-[16px] md:text-[17px] text-[#6F6F69] leading-[1.65] max-w-lg">
              {brandStory.paragraph}
            </p>
            <a
              href={brandStory.ctaHref || "#"}
              className="group inline-flex items-center gap-2 mt-8 text-[14px] font-medium text-[#171717] hover:text-[#6F6F69] transition-colors duration-300"
            >
              {brandStory.cta}
              <ArrowRight
                size={15}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
