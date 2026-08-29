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
      className="py-20 md:py-32 px-10 md:px-16"
      style={{ background: "#FAFAF7" }}
    >
      <div className="max-w-[1440px] mx-auto">
        <SectionHeading
          heading={collection.heading}
          subheading={collection.subheading}
        />

        {/* Asymmetric Grid */}
        <div className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {/* Large featured product */}
          <div className="md:col-span-5">
            <ProductCard
              product={featuredProducts[0]}
              index={0}
              imageHeight="aspect-[3/4.2]"
            />
          </div>

          {/* Two smaller products stacked */}
          <div className="md:col-span-3 flex flex-col gap-5 md:gap-6">
            <ProductCard
              product={featuredProducts[1]}
              index={1}
              imageHeight="aspect-[3/3.5]"
            />
            <ProductCard
              product={featuredProducts[2]}
              index={2}
              imageHeight="aspect-[3/3.5]"
            />
          </div>

          {/* Wide product */}
          <div className="md:col-span-4">
            <ProductCard
              product={featuredProducts[3]}
              index={3}
              imageHeight="aspect-[3/4.2]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
