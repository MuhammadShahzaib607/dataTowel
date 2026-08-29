"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Droplets, Feather, Scale, Shield } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { siteContent } from "@/lib/data/content";

const icons = [Feather, Droplets, Scale, Shield];

const { features } = siteContent;

export default function FeatureGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-20 md:py-32 px-10 md:px-16"
      style={{ background: "#F7F4ED" }}
    >
      <div className="max-w-[1440px] mx-auto">
        <SectionHeading heading={features.heading} />

        <div className="mt-14 md:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
          {features.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={item.number}
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-center md:text-left"
              >
                <div className="inline-flex items-center justify-center w-[52px] h-[52px] rounded-full bg-white mb-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <Icon
                    size={22}
                    strokeWidth={1.5}
                    className="text-[#171717]"
                  />
                </div>
                <span className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-[#96958D] mb-2">
                  {item.number}
                </span>
                <h3 className="text-[17px] font-semibold text-[#171717] mb-2">
                  {item.title}
                </h3>
                <p className="text-[14px] text-[#6F6F69] leading-[1.65]">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
