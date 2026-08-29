"use client";

import Link from "next/link";
import { Globe, MessageCircle, AtSign } from "lucide-react";
import { siteContent } from "@/lib/data/content";

const socialLinks = [
  { icon: Globe, href: "#", label: "Website" },
  { icon: MessageCircle, href: "#", label: "Chat" },
  { icon: AtSign, href: "#", label: "Social" },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E8E6DF]/50">
      <div className="max-w-[1440px] mx-auto px-10 md:px-16 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-4">
            <Link
              href="/"
              className="text-[20px] font-semibold tracking-tight text-[#171717]"
            >
              {siteContent.brand.name}
            </Link>
            <p className="mt-4 text-[14px] text-[#6F6F69] leading-[1.65] max-w-xs">
              Thoughtfully crafted towels for everyday rituals. Premium cotton,
              timeless design, exceptional softness.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full border border-[#E8E6DF] flex items-center justify-center text-[#6F6F69] hover:bg-[#171717] hover:text-white hover:border-[#171717] transition-all duration-300"
                >
                  <social.icon size={15} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {siteContent.footer.sections.map((section) => (
            <div
              key={section.title}
              className="md:col-span-2 md:col-start-auto"
            >
              <h3 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#96958D] mb-5">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[14px] text-[#6F6F69] hover:text-[#171717] transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Spacer for grid alignment */}
          <div className="hidden md:block md:col-span-2" />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#E8E6DF]/50">
        <div className="max-w-[1440px] mx-auto px-10 md:px-16 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-[#96958D]">
            &copy; 2026 {siteContent.brand.name} All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-[12px] text-[#96958D] hover:text-[#171717] transition-colors duration-300"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-[12px] text-[#96958D] hover:text-[#171717] transition-colors duration-300"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
