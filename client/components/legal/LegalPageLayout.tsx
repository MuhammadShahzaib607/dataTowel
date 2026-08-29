"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";

interface LegalSection {
  id: string;
  number: string;
  title: string;
  content: string;
  isContact?: boolean;
}

interface LegalPageLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
  contactEmail: string;
  contactPhone: string;
  contactLocation: string;
}

export default function LegalPageLayout({
  eyebrow,
  title,
  description,
  lastUpdated,
  sections,
  contactEmail,
  contactPhone,
  contactLocation,
}: LegalPageLayoutProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || "");

  return (
    <main style={{ background: "#FAFAF7" }}>
      {/* Hero */}
      <section className="pt-36 md:pt-44 pb-16 md:pb-20 px-10 md:px-16">
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-[700px]"
          >
            <p className="text-[11px] md:text-xs font-semibold tracking-[0.18em] uppercase text-[#96958D] mb-4">
              {eyebrow}
            </p>
            <h1
              className="font-medium text-[#171717]"
              style={{
                fontSize: "clamp(36px, 4.5vw, 60px)",
                lineHeight: "1.05",
                letterSpacing: "-0.04em",
              }}
            >
              {title}
            </h1>
            <p className="mt-5 text-[16px] md:text-[17px] text-[#6F6F69] leading-[1.65] max-w-[600px]">
              {description}
            </p>
            <p className="mt-4 text-[13px] text-[#96958D]">
              Last updated: {lastUpdated}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1440px] mx-auto px-10 md:px-16">
        <div className="h-px bg-[#E8E6DF]/60" />
      </div>

      {/* Content — two-column with sticky TOC */}
      <section className="py-16 md:py-24 px-10 md:px-16">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* LEFT — Table of Contents */}
            <div className="lg:col-span-3">
              <nav className="lg:sticky lg:top-28">
                <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#96958D] mb-4">
                  Contents
                </p>
                <ul className="space-y-1">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        onClick={() => setActiveSection(section.id)}
                        className={`block py-2 text-[13px] transition-colors duration-200 border-l-2 pl-4 ${
                          activeSection === section.id
                            ? "text-[#171717] font-medium border-[#171717]"
                            : "text-[#96958D] border-transparent hover:text-[#6F6F69] hover:border-[#E8E6DF]"
                        }`}
                      >
                        <span className="text-[11px] mr-2 opacity-50">
                          {section.number}
                        </span>
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* RIGHT — Content */}
            <div className="lg:col-span-9">
              <div className="max-w-[720px]">
                {sections.map((section, i) => (
                  <article
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-28"
                  >
                    {/* Section header */}
                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="text-[11px] font-semibold tracking-[0.15em] text-[#96958D]">
                        {section.number}
                      </span>
                      <h2
                        className="font-medium text-[#171717]"
                        style={{
                          fontSize: "clamp(20px, 2.5vw, 26px)",
                          lineHeight: "1.2",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {section.title}
                      </h2>
                    </div>

                    {/* Contact card */}
                    {section.isContact ? (
                      <div className="mt-6 p-6 md:p-8 bg-white rounded-[12px] border border-[rgba(0,0,0,0.06)] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                        <p className="text-[15px] text-[#6F6F69] leading-[1.65] mb-6">
                          {section.content}
                        </p>
                        <div className="space-y-4">
                          <a
                            href={`mailto:${contactEmail}`}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-[36px] h-[36px] rounded-full bg-[#FAFAF7] border border-[#E8E6DF] flex items-center justify-center shrink-0 group-hover:bg-[#171717] group-hover:border-[#171717] transition-all duration-300">
                              <Mail
                                size={14}
                                strokeWidth={1.5}
                                className="text-[#6F6F69] group-hover:text-white transition-colors duration-300"
                              />
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#96958D]">
                                Email
                              </p>
                              <p className="text-[14px] text-[#171717] group-hover:text-[#6F6F69] transition-colors duration-300">
                                {contactEmail}
                              </p>
                            </div>
                          </a>
                          <a
                            href={`tel:${contactPhone.replace(/\s/g, "")}`}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-[36px] h-[36px] rounded-full bg-[#FAFAF7] border border-[#E8E6DF] flex items-center justify-center shrink-0 group-hover:bg-[#171717] group-hover:border-[#171717] transition-all duration-300">
                              <Phone
                                size={14}
                                strokeWidth={1.5}
                                className="text-[#6F6F69] group-hover:text-white transition-colors duration-300"
                              />
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#96958D]">
                                Phone
                              </p>
                              <p className="text-[14px] text-[#171717] group-hover:text-[#6F6F69] transition-colors duration-300">
                                {contactPhone}
                              </p>
                            </div>
                          </a>
                          <div className="flex items-center gap-3">
                            <div className="w-[36px] h-[36px] rounded-full bg-[#FAFAF7] border border-[#E8E6DF] flex items-center justify-center shrink-0">
                              <MapPin
                                size={14}
                                strokeWidth={1.5}
                                className="text-[#6F6F69]"
                              />
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#96958D]">
                                Location
                              </p>
                              <p className="text-[14px] text-[#171717]">
                                {contactLocation}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[15px] text-[#6F6F69] leading-[1.75] whitespace-pre-line mb-12">
                        {section.content}
                      </div>
                    )}

                    {/* Separator (except after last) */}
                    {i < sections.length - 1 && !section.isContact && (
                      <div className="my-12 h-px bg-[#E8E6DF]/50" />
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
