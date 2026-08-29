"use client";

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { siteContent } from "@/lib/data/content";

const { newsletter } = siteContent;

export default function Newsletter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section
      ref={ref}
      className="py-20 md:py-32 px-10 md:px-16"
      style={{ background: "#F7F4ED" }}
    >
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-xl mx-auto text-center"
        >
          <h2
            className="font-medium text-[#171717]"
            style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              lineHeight: "1.08",
              letterSpacing: "-0.035em",
            }}
          >
            {newsletter.heading}
          </h2>
          <p className="mt-4 text-[16px] text-[#6F6F69] leading-[1.65]">
            {newsletter.paragraph}
          </p>

          {submitted ? (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-[14px] font-medium text-[#6F6F69]"
            >
              Thank you for subscribing. Welcome to the ritual.
            </motion.p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={newsletter.placeholder}
                required
                className="flex-1 px-5 h-[52px] bg-white border border-[#E8E6DF] rounded-full text-[14px] text-[#171717] placeholder:text-[#96958D] focus:outline-none focus:border-[#D8CBB8] transition-colors duration-300"
              />
              <button
                type="submit"
                className="group inline-flex items-center justify-center gap-2 bg-[#171717] text-white px-8 h-[52px] rounded-full text-[14px] font-medium hover:bg-[#2a2a2a] transition-colors duration-300 hover:-translate-y-[2px]"
              >
                {newsletter.cta}
                <ArrowRight
                  size={15}
                  strokeWidth={2}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
