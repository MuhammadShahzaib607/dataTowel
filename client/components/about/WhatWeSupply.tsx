"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const products = [
  {
    name: "Premium Bath Towels",
    image: "/images/bath-towel.png",
    description: "Thick, absorbent cotton towels for daily guest use.",
  },
  {
    name: "Hand Towels",
    image: "/images/hand-towels.png",
    description: "Compact, soft towels for washrooms and guest bathrooms.",
  },
  {
    name: "Bedsheets",
    image: "/images/bedsheet.png",
    description: "Soft, breathable cotton bedsheets for hotel rooms and guesthouses.",
  },
  {
    name: "Cleaning & Utility Towels",
    image: "/images/cleaning-towels.png",
    description: "Heavy-duty wiping cloths for kitchens and housekeeping.",
  },
  {
    name: "Bath Sheets",
    image: "/images/bath-towel.png",
    description: "Generous-sized towels for maximum comfort and coverage.",
  },
  {
    name: "Commercial Linen",
    image: "/images/bedsheet.png",
    description: "Complete linen solutions for hospitality and healthcare.",
  },
];

export default function WhatWeSupply() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-20 md:py-32 px-10 md:px-16"
      style={{ background: "#FAFAF7" }}
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
            Everything Your Business Needs, Under One Roof.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 25 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative bg-white rounded-[12px] border border-[rgba(0,0,0,0.07)] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#F5F3EE]">
                <img
                  src={product.image}
                  alt={`DataTowel ${product.name}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-5 md:p-6">
                <h3 className="text-[15px] font-semibold text-[#171717] mb-1.5">
                  {product.name}
                </h3>
                <p className="text-[13px] text-[#6F6F69] leading-[1.6]">
                  {product.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
