"use client";

import SectionHeading from "./SectionHeading";
import ProductCard from "./ProductCard";
import { siteContent } from "@/lib/data/content";
import { featuredProducts } from "@/lib/data/products";

const { collection } = siteContent;

export default function FeaturedCollection() {
  return (
    <section
      id="shop"
      className="pt-20 pb-8 md:pt-20 md:pb-30 px-5 sm:px-8 md:px-16"
      style={{ background: "#FAFAF7" }}
    >
      <div className="max-w-[1440px] mx-auto">
        <SectionHeading
          heading={collection.heading}
          subheading={collection.subheading}
        />

        {/* Asymmetric Grid */}
        <div className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 lg:gap-6">
          {/* Large featured product — Bedsheet */}
          <div className="md:col-span-5">
            <ProductCard
              product={featuredProducts[0]}
              index={0}
              imageHeight="aspect-[3/4]"
            />
          </div>

          {/* Two smaller products stacked — Bath Towel + Cleaning Towels */}
          <div className="md:col-span-3 flex flex-col gap-4 md:gap-5 lg:gap-6">
            <ProductCard
              product={featuredProducts[1]}
              index={1}
              imageHeight="aspect-[3/3.2]"
            />
            <ProductCard
              product={featuredProducts[2]}
              index={2}
              imageHeight="aspect-[3/3.2]"
            />
          </div>

          {/* Large right product — Hand Towels */}
          <div className="md:col-span-4">
            <ProductCard
              product={featuredProducts[3]}
              index={3}
              imageHeight="aspect-[3/4]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
