"use client";

import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { removeFromCart, updateQuantity, clearCart } from "@/lib/store/cartSlice";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, ImagePlus } from "lucide-react";
import { openAuthModal } from "@/lib/store/uiSlice";

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const totalAmount = useAppSelector((state) => state.cart.totalAmount);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#FAFAF7]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-16 pt-32 pb-20">
          <h1 className="text-[32px] md:text-[40px] font-semibold text-[#171717] tracking-tight mb-8">
            Shopping Cart
          </h1>
          <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-16 text-center">
            <ShoppingBag size={40} className="text-[#D8CBB8] mx-auto mb-4" />
            <p className="text-[16px] font-medium text-[#171717] mb-1">
              Your cart is empty
            </p>
            <p className="text-[13px] text-[#96958D] mb-6">
              Add some products to get started.
            </p>
            <button
              onClick={() => router.push("/products")}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#171717] text-white text-[13px] font-medium hover:bg-[#2a2a2a] transition-all cursor-pointer"
            >
              <ArrowLeft size={16} strokeWidth={1.5} />
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 pt-32 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[32px] md:text-[40px] font-semibold text-[#171717] tracking-tight">
            Shopping Cart
          </h1>
          <button
            onClick={() => dispatch(clearCart())}
            className="text-[13px] text-[#96958D] hover:text-red-500 transition-colors cursor-pointer"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Cart Items */}
          <div className="space-y-4">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-[1fr_100px_120px_100px_40px] gap-4 px-6 py-3 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span className="text-right">Total</span>
              <span />
            </div>

            {items.map((item) => (
              <div
                key={`${item.id}-${item.variant || ""}`}
                className="bg-white rounded-xl border border-[#E8E6DF]/50 p-4 md:p-6"
              >
                {/* Mobile Layout */}
                <div className="md:hidden">
                  <div className="flex gap-4 mb-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#F2EFE8] flex-shrink-0">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImagePlus size={16} className="text-[#D8CBB8]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-medium text-[#171717] truncate">
                        {item.name}
                      </h3>
                      {item.variant && (
                        <p className="text-[12px] text-[#96958D] mt-0.5">
                          Size: {item.variant}
                        </p>
                      )}
                      <p className="text-[14px] font-medium text-[#171717] mt-1">
                        ₨{item.price.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        dispatch(
                          removeFromCart({
                            id: item.id,
                            variant: item.variant,
                          })
                        )
                      }
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[#96958D] hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
                    >
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center border border-[#E8E6DF] rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              id: item.id,
                              variant: item.variant,
                              quantity: Math.max(1, item.quantity - 1),
                            })
                          )
                        }
                        className="w-9 h-9 flex items-center justify-center text-[#6F6F69] hover:bg-[#F2EFE8] cursor-pointer"
                      >
                        <Minus size={14} strokeWidth={1.5} />
                      </button>
                      <span className="w-10 h-9 flex items-center justify-center text-[13px] font-medium text-[#171717] border-x border-[#E8E6DF]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              id: item.id,
                              variant: item.variant,
                              quantity: item.quantity + 1,
                            })
                          )
                        }
                        className="w-9 h-9 flex items-center justify-center text-[#6F6F69] hover:bg-[#F2EFE8] cursor-pointer"
                      >
                        <Plus size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                    <span className="text-[14px] font-semibold text-[#171717]">
                      ₨{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:grid grid-cols-[1fr_100px_120px_100px_40px] gap-4 items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F2EFE8] flex-shrink-0">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImagePlus size={14} className="text-[#D8CBB8]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-[#171717] truncate">
                        {item.name}
                      </p>
                      {item.variant && (
                        <p className="text-[11px] text-[#96958D]">
                          Size: {item.variant}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[13px] text-[#6F6F69]">
                    ₨{item.price.toLocaleString()}
                  </span>
                  <div className="inline-flex items-center border border-[#E8E6DF] rounded-lg overflow-hidden">
                    <button
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            id: item.id,
                            variant: item.variant,
                            quantity: Math.max(1, item.quantity - 1),
                          })
                        )
                      }
                      className="w-9 h-9 flex items-center justify-center text-[#6F6F69] hover:bg-[#F2EFE8] cursor-pointer"
                    >
                      <Minus size={14} strokeWidth={1.5} />
                    </button>
                    <span className="w-10 h-9 flex items-center justify-center text-[13px] font-medium text-[#171717] border-x border-[#E8E6DF]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            id: item.id,
                            variant: item.variant,
                            quantity: item.quantity + 1,
                          })
                        )
                      }
                      className="w-9 h-9 flex items-center justify-center text-[#6F6F69] hover:bg-[#F2EFE8] cursor-pointer"
                    >
                      <Plus size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                  <span className="text-[13px] font-semibold text-[#171717] text-right">
                    ₨{(item.price * item.quantity).toLocaleString()}
                  </span>
                  <button
                    onClick={() =>
                      dispatch(
                        removeFromCart({
                          id: item.id,
                          variant: item.variant,
                        })
                      )
                    }
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#96958D] hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer justify-self-end"
                  >
                    <Trash2 size={15} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6">
              <h2 className="text-[15px] font-semibold text-[#171717] mb-5">
                Order Summary
              </h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#6F6F69]">Subtotal</span>
                  <span className="font-medium text-[#171717]">
                    ₨{totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#6F6F69]">Shipping</span>
                  <span className="text-[#96958D]">Calculated at checkout</span>
                </div>
              </div>

              <div className="h-px bg-[#E8E6DF]/50 mb-5" />

              <div className="flex justify-between mb-6">
                <span className="text-[14px] font-semibold text-[#171717]">
                  Total
                </span>
                <span className="text-[18px] font-semibold text-[#171717]">
                  ₨{totalAmount.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    dispatch(openAuthModal("login"));
                    return;
                  }
                  router.push("/checkout");
                }}
                className="w-full h-12 rounded-xl bg-[#171717] text-white text-[14px] font-medium hover:bg-[#2a2a2a] transition-all cursor-pointer mb-3"
              >
                Checkout
              </button>

              <button
                onClick={() => router.push("/products")}
                className="w-full h-12 rounded-xl border border-[#E8E6DF] text-[14px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
