"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, Phone } from "lucide-react";
import Link from "next/link";

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const categories = [
  "All",
  "Products",
  "Bulk Orders",
  "Pricing",
  "Delivery",
  "Returns",
  "Care",
  "Business",
];

const faqs: FAQ[] = [
  // PRODUCTS
  {
    question: "What products does DataTowel supply?",
    answer:
      "DataTowel supplies premium cotton towels, bedsheets and linens for businesses across Pakistan. Our range includes bath towels, hand towels, bath sheets, cleaning and utility towels, bedsheets and other commercial linen requirements.",
    category: "Products",
  },
  {
    question: "Are DataTowel products suitable for hotels and commercial use?",
    answer:
      "Yes. Our products are supplied for everyday commercial use in hotels, guesthouses, restaurants, gyms, spas, clinics and other businesses where durability and consistent quality matter.",
    category: "Products",
  },
  {
    question: "What GSM options are available?",
    answer:
      "Our available GSM options depend on the product and current stock. Our standard premium towel range includes 600 GSM options, while other specifications may be available for bulk requirements. Contact us with your required product and quantity so we can recommend a suitable option.",
    category: "Products",
  },
  {
    question: "Can I request a specific size or specification?",
    answer:
      "Yes. For bulk orders, you can share your preferred size, GSM, material, color and quantity with our team. We'll confirm what is available and provide suitable options.",
    category: "Products",
  },
  // BULK ORDERS
  {
    question: "Do you offer bulk pricing?",
    answer:
      "Yes. DataTowel is focused on B2B and bulk supply. Pricing can vary depending on the product, quantity, specifications and delivery requirements. Contact us for a bulk quotation.",
    category: "Bulk Orders",
  },
  {
    question: "What is the minimum order quantity?",
    answer:
      "Minimum quantities can vary depending on the product and order requirements. Send us your required products and estimated quantities and we'll let you know the available options.",
    category: "Bulk Orders",
  },
  {
    question: "Can hotels place recurring orders?",
    answer:
      "Yes. We work with businesses that need to replenish towels, bedsheets and linens regularly. Contact us to discuss your recurring supply requirements.",
    category: "Bulk Orders",
  },
  {
    question: "Can retailers and supermarkets order in bulk?",
    answer:
      "Yes. We supply businesses that purchase textile products in quantity, including retail marts and supermarkets.",
    category: "Bulk Orders",
  },
  // PRICING
  {
    question: "Are the prices shown on the website final?",
    answer:
      "Website prices may represent starting or indicative prices. Final pricing for bulk orders depends on the product, quantity, specifications and availability. We'll confirm the applicable price when preparing your quotation.",
    category: "Pricing",
  },
  {
    question: "How can I get a bulk quotation?",
    answer:
      "Use our Contact page and submit your requirements through the bulk inquiry form, or contact us directly at +92 340 3004439 or datatowel.admin@gmail.com.",
    category: "Pricing",
  },
  // DELIVERY
  {
    question: "Where does DataTowel deliver?",
    answer:
      "DataTowel is based in Karachi and supplies businesses across Pakistan.",
    category: "Delivery",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery time depends on the order size, product availability, destination and logistics. We'll provide an estimated timeline during the quotation or order process.",
    category: "Delivery",
  },
  // RETURNS
  {
    question: "Can I return or exchange products?",
    answer:
      "Returns and exchanges depend on the applicable DataTowel return policy and the terms agreed for the specific order. Contact us before placing an order if you have questions about returns.",
    category: "Returns",
  },
  // CARE
  {
    question: "How should I care for DataTowel cotton towels?",
    answer:
      "For the best results, follow the care instructions provided with your specific product. In general, proper washing and drying practices help maintain cotton softness, absorbency and durability over time.",
    category: "Care",
  },
  {
    question: "Can your towels handle frequent commercial washing?",
    answer:
      "Our commercial-use products are designed with everyday use in mind. For high-frequency hotel, gym, restaurant or housekeeping use, contact us with your requirements so we can recommend an appropriate product.",
    category: "Care",
  },
  // BUSINESS
  {
    question: "Who can order from DataTowel?",
    answer:
      "We primarily supply businesses including hotels, restaurants, gyms, spas, guesthouses, hospitals, clinics, retail marts and supermarkets.",
    category: "Business",
  },
  {
    question: "How do I contact DataTowel?",
    answer:
      "You can reach us at:\n\nPhone: +92 340 3004439\nEmail: datatowel.admin@gmail.com\nLocation: Karachi, Pakistan",
    category: "Business",
  },
];

const categoryNumbers: Record<string, string> = {
  Products: "01",
  "Bulk Orders": "02",
  Pricing: "03",
  Delivery: "04",
  Returns: "05",
  Care: "06",
  Business: "07",
};

export default function FAQsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFaqs = useMemo(() => {
    let result = faqs;

    if (activeCategory !== "All") {
      result = result.filter((faq) => faq.category === activeCategory);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query) ||
          faq.category.toLowerCase().includes(query)
      );
    }

    return result;
  }, [search, activeCategory]);

  // Group by category
  const groupedFaqs = useMemo(() => {
    const groups: { category: string; items: FAQ[] }[] = [];
    const seen = new Set<string>();

    filteredFaqs.forEach((faq) => {
      if (!seen.has(faq.category)) {
        seen.add(faq.category);
        groups.push({
          category: faq.category,
          items: filteredFaqs.filter((f) => f.category === faq.category),
        });
      }
    });

    return groups;
  }, [filteredFaqs]);

  const toggleFaq = (globalIndex: number) => {
    setOpenIndex((prev) => (prev === globalIndex ? null : globalIndex));
  };

  let globalCounter = 0;

  return (
    <main style={{ background: "#FAFAF7" }}>
      {/* Hero */}
      <section className="pt-36 md:pt-44 pb-12 md:pb-16 px-10 md:px-16">
        <div className="max-w-[1440px] mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[11px] md:text-xs font-semibold tracking-[0.18em] uppercase text-[#96958D] mb-4"
          >
            DataTowel FAQ
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-medium text-[#171717] whitespace-pre-line"
            style={{
              fontSize: "clamp(36px, 5vw, 64px)",
              lineHeight: "1.05",
              letterSpacing: "-0.04em",
            }}
          >
            {"Questions?\nWe\u2019ve Got Answers."}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 text-[16px] md:text-[17px] text-[#6F6F69] leading-[1.65] max-w-xl mx-auto"
          >
            Everything you need to know about our towels, bedsheets, linens,
            bulk orders and working with DataTowel.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-8 max-w-[520px] mx-auto"
          >
            <div className="relative">
              <Search
                size={18}
                strokeWidth={1.5}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-[#96958D]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setOpenIndex(null);
                }}
                placeholder="Search your question..."
                className="w-full pl-13 pr-5 h-[56px] bg-white border border-[#E8E6DF] rounded-full text-[15px] text-[#171717] placeholder:text-[#96958D] shadow-[0_4px_20px_rgba(0,0,0,0.04)] focus:outline-none focus:border-[#171717]/20 focus:ring-2 focus:ring-[#171717]/5 transition-all duration-300"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="pb-8 md:pb-12 px-10 md:px-16">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setOpenIndex(null);
                }}
                className={`shrink-0 px-5 h-[38px] rounded-full text-[13px] font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-[#171717] text-white"
                    : "bg-white text-[#6F6F69] border border-[#E8E6DF] hover:border-[#D8CBB8] hover:text-[#171717]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="pb-16 md:pb-24 px-10 md:px-16">
        <div className="max-w-[1440px] mx-auto">
          {groupedFaqs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-[16px] text-[#6F6F69]">
                No matching questions found.
              </p>
              <p className="mt-2 text-[14px] text-[#96958D]">
                Still need help? Contact our team and we&apos;ll help you with
                your requirements.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 mt-6 bg-[#171717] text-white px-7 h-[46px] rounded-full text-[13px] font-medium hover:bg-[#2a2a2a] transition-all duration-300"
              >
                Contact DataTowel
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Desktop: category indicator */}
              <div className="hidden lg:block lg:col-span-3">
                <div className="sticky top-28 space-y-6">
                  {groupedFaqs.map((group) => (
                    <div key={group.category}>
                      <span className="text-[40px] font-light text-[#E8E6DF] leading-none block">
                        {categoryNumbers[group.category] || "00"}
                      </span>
                      <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#96958D] mt-1">
                        {group.category}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ Accordion */}
              <div className="lg:col-span-9">
                {groupedFaqs.map((group) => (
                  <div key={group.category} className="mb-10 last:mb-0">
                    {/* Mobile category label */}
                    <div className="lg:hidden flex items-baseline gap-2 mb-4">
                      <span className="text-[24px] font-light text-[#E8E6DF] leading-none">
                        {categoryNumbers[group.category] || "00"}
                      </span>
                      <h2 className="text-[13px] font-semibold tracking-[0.15em] uppercase text-[#96958D]">
                        {group.category}
                      </h2>
                    </div>

                    {/* Questions */}
                    <div className="space-y-0">
                      {group.items.map((faq) => {
                        const currentIndex = globalCounter++;
                        const isOpen = openIndex === currentIndex;
                        return (
                          <div
                            key={faq.question}
                            className={`border-b border-[#E8E6DF]/60 transition-colors duration-200 ${
                              isOpen ? "bg-white/60" : ""
                            }`}
                          >
                            <button
                              onClick={() => toggleFaq(currentIndex)}
                              className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                              aria-expanded={isOpen}
                            >
                              <span
                                className={`text-[15px] md:text-[16px] font-medium transition-colors duration-200 ${
                                  isOpen
                                    ? "text-[#171717]"
                                    : "text-[#6F6F69] group-hover:text-[#171717]"
                                }`}
                              >
                                {faq.question}
                              </span>
                              <motion.span
                                animate={{ rotate: isOpen ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="shrink-0"
                              >
                                <ChevronRight
                                  size={16}
                                  strokeWidth={1.5}
                                  className={`transition-colors duration-200 ${
                                    isOpen
                                      ? "text-[#171717]"
                                      : "text-[#96958D]"
                                  }`}
                                />
                              </motion.span>
                            </button>
                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                  className="overflow-hidden"
                                >
                                  <div className="pb-5 text-[14px] text-[#6F6F69] leading-[1.7] max-w-[640px] whitespace-pre-line">
                                    {faq.answer}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Help CTA */}
      <section className="py-16 md:py-24 px-10 md:px-16" style={{ background: "#FFFFFF" }}>
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <p className="text-[11px] md:text-xs font-semibold tracking-[0.18em] uppercase text-[#96958D] mb-4">
              Still Have Questions?
            </p>
            <h2
              className="font-medium text-[#171717]"
              style={{
                fontSize: "clamp(28px, 3.5vw, 44px)",
                lineHeight: "1.1",
                letterSpacing: "-0.035em",
              }}
            >
              Let&apos;s Find the Right Answer.
            </h2>
            <p className="mt-4 text-[15px] text-[#6F6F69] leading-[1.65] max-w-md mx-auto">
              Can&apos;t find what you&apos;re looking for? Tell us what you
              need and our team will help you with products, quantities and
              bulk pricing.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2.5 bg-[#171717] text-white px-8 h-[50px] rounded-full text-[13px] font-medium hover:bg-[#2a2a2a] transition-all duration-300 hover:-translate-y-[1px]"
              >
                Contact Us
              </Link>
              <a
                href="tel:+923403004439"
                className="group inline-flex items-center justify-center gap-2.5 border border-[#D8CBB8] text-[#171717] px-8 h-[50px] rounded-full text-[13px] font-medium hover:bg-[#F7F4ED] transition-all duration-300 hover:-translate-y-[1px]"
              >
                <Phone size={14} strokeWidth={2} />
                Call +92 340 3004439
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Contact Strip */}
      <section className="py-8 px-10 md:px-16 border-t border-[#E8E6DF]/50">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <p className="text-[13px] text-[#96958D]">
            Questions about a bulk order?
          </p>
          <div className="flex items-center gap-5">
            <a
              href="tel:+923403004439"
              className="text-[13px] font-medium text-[#171717] hover:text-[#6F6F69] transition-colors duration-200"
            >
              +92 340 3004439
            </a>
            <span className="text-[#E8E6DF]">|</span>
            <a
              href="mailto:datatowel.admin@gmail.com"
              className="text-[13px] font-medium text-[#171717] hover:text-[#6F6F69] transition-colors duration-200"
            >
              datatowel.admin@gmail.com
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
