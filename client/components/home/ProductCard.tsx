"use client";

import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addToCart } from "@/lib/store/cartSlice";
import { toggleWishlist } from "@/lib/store/wishlistSlice";
import type { Product } from "@/lib/data/products";

interface ProductCardProps {
  product: Product;
  index: number;
  className?: string;
  imageHeight?: string;
}

export default function ProductCard({
  product,
  index,
  className = "",
  imageHeight = "aspect-[3/4]",
}: ProductCardProps) {
  const dispatch = useAppDispatch();
  const isWishlisted = useAppSelector((state) =>
    state.wishlist.items.some((item) => item.id === product.id)
  );

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        variant: product.variants?.[0],
      })
    );
  };

  const handleToggleWishlist = () => {
    dispatch(
      toggleWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      })
    );
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`group relative bg-white rounded-[14px] border border-[#ECEAE4] overflow-hidden transition-all duration-500 hover:-translate-y-[3px] hover:shadow-[0_15px_40px_rgba(20,20,20,0.08)] shadow-[0_8px_30px_rgba(20,20,20,0.05)] ${className}`}
    >
      {/* Image */}
      <div
        className={`relative ${imageHeight} overflow-hidden bg-[#F2EFE8]`}
      >
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full text-[#171717]">
            {product.badge}
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            handleToggleWishlist();
          }}
          aria-label={
            isWishlisted ? "Remove from wishlist" : "Add to wishlist"
          }
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
        >
          <Heart
            size={15}
            strokeWidth={1.5}
            className={
              isWishlisted
                ? "fill-[#171717] text-[#171717]"
                : "text-[#6F6F69]"
            }
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-[14px] font-semibold text-[#171717] leading-tight">
          {product.name}
        </h3>
        <p className="mt-1.5 text-[13px] text-[#6F6F69] leading-relaxed">
          {product.shortDescription}
        </p>
        <div className="mt-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-[#171717]">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-[12px] text-[#96958D] line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart();
            }}
            aria-label={`Add ${product.name} to cart`}
            className="group/btn inline-flex items-center gap-1.5 text-[13px] font-medium text-[#171717] hover:text-[#6F6F69] transition-colors duration-300"
          >
            Add
            <ArrowRight
              size={13}
              strokeWidth={2}
              className="transition-transform duration-300 group-hover/btn:translate-x-0.5"
            />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
