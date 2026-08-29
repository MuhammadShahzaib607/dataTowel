"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Building2, UtensilsCrossed, Dumbbell, Home, Stethoscope, Store } from "lucide-react";

const businesses = [
  {
    icon: Building2,
    title: "Hotels",
    description:
      "Guest-room towels, bath linen and bedsheets built for daily turnover.",
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurants",
    description:
      "Reliable kitchen and utility towels for busy service environments.",
  },
  {
    icon: Dumbbell,
    title: "Gyms & Spas",
    description:
      "Soft, absorbent towels your members and guests will notice.",
  },
  {
    icon: Home,
    title: "Guesthouses",
    description:
      "Comfortable, dependable linen for every room.",
  },
  {
    icon: Stethoscope,
    title: "Hospitals & Clinics",
    description:
      "Practical, durable textile supplies for demanding daily use.",
  },
  {
    icon: Store,
    title: "Retail Marts & Supermarkets",
    description:
      "Bulk textile supply for stores that need consistent stock.",
  },
];

export default function WhoWeServe() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-20 md:py-32 px-10 md:px-16"
      style={{ background: "#F7F4ED" }}
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
            Made for Businesses That Use Linen Every Day.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {businesses.map((biz, i) => {
            const Icon = biz.icon;
            return (
              <motion.div
                key={biz.title}
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.06)] p-7 md:p-8 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)]"
              >
                <div className="w-[44px] h-[44px] rounded-full bg-[#FAFAF7] border border-[#E8E6DF] flex items-center justify-center mb-5">
                  <Icon size={20} strokeWidth={1.5} className="text-[#171717]" />
                </div>
                <h3 className="text-[17px] font-semibold text-[#171717] mb-2">
                  {biz.title}
                </h3>
                <p className="text-[14px] text-[#6F6F69] leading-[1.65]">
                  {biz.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
