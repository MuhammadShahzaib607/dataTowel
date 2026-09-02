"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function OurStory() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="py-20 md:py-32 px-10 md:px-16"
      style={{ background: "#FAFAF7" }}
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <p className="text-[11px] md:text-xs font-semibold tracking-[0.18em] uppercase text-[#96958D] mb-4">
              Our Story
            </p>
            <h2
              className="font-medium text-[#171717] whitespace-pre-line"
              style={{
                fontSize: "clamp(32px, 4vw, 48px)",
                lineHeight: "1.08",
                letterSpacing: "-0.035em",
              }}
            >
              {"From a Small Supplier\nto a Trusted Business Partner."}
            </h2>
            <div className="mt-6 space-y-4 text-[16px] text-[#6F6F69] leading-[1.7]">
              <p>
                DataTowel started with a simple idea: businesses shouldn&apos;t
                have to choose between good quality and reliable pricing.
              </p>
              <p>
                We began as a small family supplier, serving local businesses
                and learning what they actually needed, products that feel
                good, survive daily use and arrive when promised.
              </p>
              <p>
                Over time, those relationships grew.
              </p>
              <p>
                Today, DataTowel supplies hotels, restaurants, gyms, spas,
                guesthouses, hospitals, clinics and retail businesses across
                Pakistan.
              </p>
            </div>
            <div className="mt-8 space-y-2">
              <p className="text-[15px] font-medium text-[#171717]">
                Our approach remains simple:
              </p>
              <ul className="text-[15px] text-[#6F6F69] space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D8CBB8]" />
                  Good products.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D8CBB8]" />
                  Fair bulk pricing.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D8CBB8]" />
                  Consistent supply.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D8CBB8]" />
                  A relationship you can rely on.
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 1.03 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/5] lg:aspect-[3/4] rounded-2xl overflow-hidden"
          >
            <img
              src="/images/about-story.png"
              alt="DataTowel cotton towels and linens arranged in a clean workspace"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
