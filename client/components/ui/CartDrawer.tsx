"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { removeFromCart, updateQuantity } from "@/lib/store/cartSlice";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const dispatch = useAppDispatch();
  const { items, totalAmount } = useAppSelector((state) => state.cart);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    };
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleRemove = (id: string, variant?: string) => {
    dispatch(removeFromCart({ id, variant }));
  };

  const handleUpdateQuantity = (
    id: string,
    variant: string | undefined,
    quantity: number
  ) => {
    if (quantity < 1) {
      handleRemove(id, variant);
      return;
    }
    dispatch(updateQuantity({ id, variant, quantity }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-[72px] border-b border-[#E8E6DF]/50">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-[#171717]" />
                <h2 className="text-[15px] font-semibold text-[#171717]">
                  Your Cart
                </h2>
                {items.length > 0 && (
                  <span className="text-[12px] text-[#96958D]">
                    ({items.length} item{items.length !== 1 ? "s" : ""})
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6F6F69] hover:bg-[#F2EFE8] hover:text-[#171717] transition-colors cursor-pointer"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <ShoppingBag
                    size={48}
                    className="text-[#D8CBB8] mb-4"
                    strokeWidth={1}
                  />
                  <p className="text-[15px] font-medium text-[#171717] mb-1">
                    Your cart is empty
                  </p>
                  <p className="text-[13px] text-[#96958D] mb-6">
                    Add some items to get started.
                  </p>
                  <button
                    onClick={onClose}
                    className="h-10 px-6 rounded-lg bg-[#171717] text-white text-[13px] font-medium hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="px-6 py-4">
                  {items.map((item) => (
                    <div
                      key={`${item.id}-${item.variant || ""}`}
                      className="flex gap-4 py-4 border-b border-[#E8E6DF]/30 last:border-0"
                    >
                      {/* Image */}
                      <div className="w-[72px] h-[72px] rounded-lg overflow-hidden bg-[#F2EFE8] flex-shrink-0">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag
                              size={20}
                              className="text-[#D8CBB8]"
                            />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[#171717] truncate">
                          {item.name}
                        </p>
                        {item.variant && (
                          <p className="text-[11px] text-[#96958D] mt-0.5">
                            Size: {item.variant}
                          </p>
                        )}
                        <p className="text-[13px] font-medium text-[#171717] mt-1">
                          Rs. {item.price.toLocaleString()}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.id,
                                item.variant,
                                item.quantity - 1
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-[#E8E6DF] text-[#6F6F69] hover:bg-[#FAFAF7] transition-colors cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-[13px] font-medium text-[#171717]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.id,
                                item.variant,
                                item.quantity + 1
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-[#E8E6DF] text-[#6F6F69] hover:bg-[#FAFAF7] transition-colors cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => handleRemove(item.id, item.variant)}
                            className="ml-auto w-7 h-7 flex items-center justify-center rounded-md text-[#96958D] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-[#E8E6DF]/50 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] text-[#6F6F69]">Subtotal</span>
                  <span className="text-[15px] font-semibold text-[#171717]">
                    Rs. {totalAmount.toLocaleString()}
                  </span>
                </div>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex items-center justify-center h-11 rounded-lg bg-[#171717] text-white text-[13px] font-medium hover:bg-[#2a2a2a] transition-colors"
                >
                  View Cart & Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
