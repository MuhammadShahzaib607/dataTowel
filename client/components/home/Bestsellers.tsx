"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { bestsellerProducts } from "@/lib/data/products";

export default function Bestsellers() {
  const ref = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      ref={ref}
      className="py-20 md:py-32"
      style={{ background: "#FAFAF7" }}
    >
      <div className="max-w-[1440px] mx-auto px-10 md:px-16">
        <div className="flex items-end justify-between mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="font-medium text-[#171717]"
              style={{
                fontSize: "clamp(32px, 4vw, 52px)",
                lineHeight: "1.08",
                letterSpacing: "-0.035em",
              }}
            >
              Bestsellers
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex items-center gap-2"
          >
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="w-10 h-10 rounded-full border border-[#E8E6DF] flex items-center justify-center text-[#6F6F69] hover:bg-[#171717] hover:text-white hover:border-[#171717] transition-all duration-300"
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="w-10 h-10 rounded-full border border-[#E8E6DF] flex items-center justify-center text-[#6F6F69] hover:bg-[#171717] hover:text-white hover:border-[#171717] transition-all duration-300"
            >
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-5 md:gap-6 overflow-x-auto snap-x snap-mandatory px-10 md:px-16"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {bestsellerProducts.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 25 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.6,
              delay: 0.1 + i * 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="min-w-[280px] md:min-w-[300px] snap-start"
          >
            <ProductCard
              product={product}
              index={i}
              imageHeight="aspect-[3/4]"
            />
          </motion.div>
        ))}
        {/* Padding for scroll */}
        <div className="min-w-2 shrink-0" />
      </div>
    </section>
  );
}
