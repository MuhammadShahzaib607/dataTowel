import type { Metadata } from "next";
import AboutHero from "@/components/about/AboutHero";
import OurStory from "@/components/about/OurStory";
import WhoWeServe from "@/components/about/WhoWeServe";
import WhatWeSupply from "@/components/about/WhatWeSupply";
import WhyDataTowel from "@/components/about/WhyDataTowel";
import QualityMaterials from "@/components/about/QualityMaterials";
import PakistanCoverage from "@/components/about/PakistanCoverage";
import AboutCTA from "@/components/about/AboutCTA";

export const metadata: Metadata = {
  title: "About DataTowel | Trusted Bulk Textile Supplier in Pakistan",
  description:
    "Learn about DataTowel, a trusted supplier of premium cotton towels, bedsheets and linens for businesses across Pakistan.",
};

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <OurStory />
      <WhoWeServe />
      <WhatWeSupply />
      <WhyDataTowel />
      <QualityMaterials />
      <PakistanCoverage />
      <AboutCTA />
    </main>
  );
}
