"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { clearCart } from "@/lib/store/cartSlice";
import { openAuthModal } from "@/lib/store/uiSlice";
import { ArrowLeft, Loader2, ImagePlus, CheckCircle } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const totalAmount = useAppSelector((state) => state.cart.totalAmount);
  const { isAuthenticated, user, token } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    customerName: user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || ""
      : "",
    customerEmail: user?.email || "",
    phone: user?.phone || "",
    city: user?.city || "",
    address: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      dispatch(openAuthModal("login"));
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const orderItems = items.map((item) => ({
        productId: item.id,
        name: item.name,
        size: item.variant || "",
        quantity: item.quantity,
        price: item.price,
      }));

      const res = await fetch(`${API_BASE_URL}/store/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: orderItems,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          notes: formData.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      dispatch(clearCart());
      setOrderPlaced(true);
      // Store order ID for redirect
      if (data.order?.id) {
        sessionStorage.setItem("lastOrderId", data.order.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  // Order success
  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-[#FAFAF7]">
        <div className="max-w-[640px] mx-auto px-6 pt-32 pb-20 text-center">
          <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
          <h1 className="text-[28px] font-semibold text-[#171717] tracking-tight mb-2">
            Order Placed!
          </h1>
          <p className="text-[15px] text-[#6F6F69] mb-8">
            Thank you for your order. We&apos;ll process it shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/dashboard/orders")}
              className="h-12 px-8 rounded-xl bg-[#171717] text-white text-[14px] font-medium hover:bg-[#2a2a2a] transition-all cursor-pointer"
            >
              View My Orders
            </button>
            <button
              onClick={() => router.push("/products")}
              className="h-12 px-8 rounded-xl border border-[#E8E6DF] text-[14px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#FAFAF7]">
        <div className="max-w-[640px] mx-auto px-6 pt-32 pb-20 text-center">
          <h1 className="text-[28px] font-semibold text-[#171717] tracking-tight mb-2">
            Nothing to checkout
          </h1>
          <p className="text-[15px] text-[#6F6F69] mb-8">
            Add some products to your cart first.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="h-12 px-8 rounded-xl bg-[#171717] text-white text-[14px] font-medium hover:bg-[#2a2a2a] transition-all cursor-pointer"
          >
            Browse Products
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 pt-32 pb-20">
        {/* Back */}
        <button
          onClick={() => router.push("/cart")}
          className="flex items-center gap-2 text-[13px] font-medium text-[#6F6F69] hover:text-[#171717] transition-colors cursor-pointer mb-8"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to Cart
        </button>

        <h1 className="text-[32px] md:text-[40px] font-semibold text-[#171717] tracking-tight mb-8">
          Checkout
        </h1>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-[13px]">
            {error}
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
            {/* Customer Information */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6">
                <h2 className="text-[15px] font-semibold text-[#171717] mb-5">
                  Customer Information
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        required
                        className="w-full h-11 px-4 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                        Email
                      </label>
                      <input
                        type="email"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        required
                        className="w-full h-11 px-4 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full h-11 px-4 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full h-11 px-4 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address, building, etc."
                      className="w-full h-11 px-4 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                      Order Notes (optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Any special instructions..."
                      className="w-full px-4 py-3 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6">
                <h2 className="text-[15px] font-semibold text-[#171717] mb-5">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-4 mb-5">
                  {items.map((item) => (
                    <div
                      key={`${item.id}-${item.variant || ""}`}
                      className="flex gap-3"
                    >
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
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[#171717] truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-[#96958D]">
                          {item.variant ? `Size: ${item.variant}` : ""}{" "}
                          {item.variant ? "· " : ""}Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-[13px] font-medium text-[#171717] flex-shrink-0">
                        ₨{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-[#E8E6DF]/50 mb-5" />

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#6F6F69]">Subtotal</span>
                    <span className="font-medium text-[#171717]">
                      ₨{totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#6F6F69]">Shipping</span>
                    <span className="text-[#96958D]">Calculated separately</span>
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

                {!isAuthenticated && (
                  <p className="text-[12px] text-[#96958D] text-center mb-4">
                    You&apos;ll need to log in to complete your order.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-xl bg-[#171717] text-white text-[14px] font-medium hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
