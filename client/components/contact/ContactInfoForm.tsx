"use client";

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Phone, Mail, MapPin, ArrowRight, Check } from "lucide-react";

const businessTypes = [
  "Hotel",
  "Restaurant",
  "Gym",
  "Spa",
  "Guesthouse",
  "Hospital",
  "Clinic",
  "Retail Mart / Supermarket",
  "Other",
];

const productOptions = [
  "Bath Towels",
  "Hand Towels",
  "Bedsheets",
  "Bath Sheets",
  "Cleaning & Utility Towels",
  "Commercial Linen",
  "Other",
];

interface FormData {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  businessType: string;
  products: string;
  quantity: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  businessType?: string;
  products?: string;
  message?: string;
}

export default function ContactInfoForm() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    businessType: "",
    products: "",
    quantity: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim())
      newErrors.fullName = "Please enter your name.";
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email.";
    }
    if (!formData.phone.trim())
      newErrors.phone = "Please enter your phone number.";
    if (!formData.businessType)
      newErrors.businessType = "Please select a business type.";
    if (!formData.products)
      newErrors.products = "Please select a product.";
    if (!formData.message.trim())
      newErrors.message = "Please tell us about your requirements.";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitted(true);
  };

  const inputClasses =
    "w-full px-5 h-[52px] bg-white border border-[#E8E6DF] rounded-[10px] text-[14px] text-[#171717] placeholder:text-[#96958D] focus:outline-none focus:border-[#171717]/20 focus:ring-2 focus:ring-[#171717]/5 transition-all duration-300";

  const selectClasses =
    "w-full px-5 h-[52px] bg-white border border-[#E8E6DF] rounded-[10px] text-[14px] text-[#171717] focus:outline-none focus:border-[#171717]/20 focus:ring-2 focus:ring-[#171717]/5 transition-all duration-300 appearance-none cursor-pointer";

  return (
    <section
      ref={ref}
      id="inquiry-form"
      className="py-20 md:py-32 px-10 md:px-16"
      style={{ background: "#FFFFFF" }}
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20">
          {/* LEFT — Contact Info */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[11px] md:text-xs font-semibold tracking-[0.18em] uppercase text-[#96958D] mb-4">
                Contact DataTowel
              </p>
              <h2
                className="font-medium text-[#171717]"
                style={{
                  fontSize: "clamp(28px, 3.5vw, 40px)",
                  lineHeight: "1.1",
                  letterSpacing: "-0.035em",
                }}
              >
                We&apos;re Here to Help.
              </h2>
              <p className="mt-4 text-[15px] text-[#6F6F69] leading-[1.65] max-w-sm">
                Whether you&apos;re sourcing linen for a hotel, restaurant, gym,
                clinic or retail business, send us your requirements.
              </p>
            </motion.div>

            {/* Contact details — elegant rows with separators */}
            <div className="mt-10">
              {/* Phone */}
              <motion.a
                href="tel:+923403004439"
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-4 py-5 border-b border-[#E8E6DF]/60 group"
              >
                <div className="w-[40px] h-[40px] rounded-full bg-[#FAFAF7] border border-[#E8E6DF] flex items-center justify-center shrink-0 group-hover:bg-[#171717] group-hover:border-[#171717] transition-all duration-300">
                  <Phone
                    size={16}
                    strokeWidth={1.5}
                    className="text-[#6F6F69] group-hover:text-white transition-colors duration-300"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#96958D]">
                    Call Us
                  </p>
                  <p className="text-[15px] font-medium text-[#171717] mt-0.5 group-hover:text-[#6F6F69] transition-colors duration-300">
                    +92 340 3004439
                  </p>
                </div>
              </motion.a>

              {/* Email */}
              <motion.a
                href="mailto:datatowel.admin@gmail.com"
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center gap-4 py-5 border-b border-[#E8E6DF]/60 group"
              >
                <div className="w-[40px] h-[40px] rounded-full bg-[#FAFAF7] border border-[#E8E6DF] flex items-center justify-center shrink-0 group-hover:bg-[#171717] group-hover:border-[#171717] transition-all duration-300">
                  <Mail
                    size={16}
                    strokeWidth={1.5}
                    className="text-[#6F6F69] group-hover:text-white transition-colors duration-300"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#96958D]">
                    Email Us
                  </p>
                  <p className="text-[15px] font-medium text-[#171717] mt-0.5 group-hover:text-[#6F6F69] transition-colors duration-300">
                    datatowel.admin@gmail.com
                  </p>
                </div>
              </motion.a>

              {/* Location */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center gap-4 py-5"
              >
                <div className="w-[40px] h-[40px] rounded-full bg-[#FAFAF7] border border-[#E8E6DF] flex items-center justify-center shrink-0">
                  <MapPin size={16} strokeWidth={1.5} className="text-[#6F6F69]" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#96958D]">
                    Serving From
                  </p>
                  <p className="text-[15px] font-medium text-[#171717] mt-0.5">
                    Karachi, Pakistan
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Bulk inquiry note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 p-5 bg-[#FAFAF7] rounded-[10px] border border-[#E8E6DF]/50"
            >
              <p className="text-[12px] font-medium text-[#6F6F69] leading-[1.6]">
                <span className="text-[#171717] font-semibold">
                  BULK INQUIRIES
                </span>{" "}
                Usually best for hotels, restaurants, gyms, clinics and
                retailers.
              </p>
            </motion.div>
          </div>

          {/* RIGHT — Form */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="bg-[#FAFAF7] rounded-[14px] border border-[#E8E6DF]/60 p-8 md:p-10"
            >
              <h3
                className="font-medium text-[#171717]"
                style={{
                  fontSize: "clamp(22px, 2.5vw, 28px)",
                  lineHeight: "1.15",
                  letterSpacing: "-0.03em",
                }}
              >
                Tell Us What You Need.
              </h3>
              <p className="mt-2.5 text-[14px] text-[#6F6F69] leading-[1.6]">
                Share a few details about your order and we&apos;ll help you
                with products, quantities and bulk pricing.
              </p>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-10 py-16 text-center"
                >
                  <div className="w-[56px] h-[56px] rounded-full bg-[#171717] flex items-center justify-center mx-auto mb-5">
                    <Check size={24} strokeWidth={2} className="text-white" />
                  </div>
                  <h4 className="text-[20px] font-medium text-[#171717]">
                    Thanks, your inquiry has been received.
                  </h4>
                  <p className="mt-3 text-[15px] text-[#6F6F69]">
                    We&apos;ll get back to you shortly.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  {/* Row 1: Full Name + Business Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-[12px] font-medium text-[#6F6F69] mb-2"
                      >
                        Full Name *
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className={inputClasses}
                      />
                      {errors.fullName && (
                        <p className="mt-1.5 text-[12px] text-[#c0392b]">
                          {errors.fullName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="businessName"
                        className="block text-[12px] font-medium text-[#6F6F69] mb-2"
                      >
                        Business Name
                      </label>
                      <input
                        id="businessName"
                        name="businessName"
                        type="text"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="Your business name"
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  {/* Row 2: Email + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-[12px] font-medium text-[#6F6F69] mb-2"
                      >
                        Email Address *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={inputClasses}
                      />
                      {errors.email && (
                        <p className="mt-1.5 text-[12px] text-[#c0392b]">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-[12px] font-medium text-[#6F6F69] mb-2"
                      >
                        Phone Number *
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+92 3XX XXXXXXX"
                        className={inputClasses}
                      />
                      {errors.phone && (
                        <p className="mt-1.5 text-[12px] text-[#c0392b]">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Business Type + Product */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="businessType"
                        className="block text-[12px] font-medium text-[#6F6F69] mb-2"
                      >
                        Business Type *
                      </label>
                      <div className="relative">
                        <select
                          id="businessType"
                          name="businessType"
                          value={formData.businessType}
                          onChange={handleChange}
                          className={selectClasses}
                        >
                          <option value="">Select your business type</option>
                          {businessTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M3 4.5L6 7.5L9 4.5" stroke="#96958D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                      {errors.businessType && (
                        <p className="mt-1.5 text-[12px] text-[#c0392b]">
                          {errors.businessType}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="products"
                        className="block text-[12px] font-medium text-[#6F6F69] mb-2"
                      >
                        Product Required *
                      </label>
                      <div className="relative">
                        <select
                          id="products"
                          name="products"
                          value={formData.products}
                          onChange={handleChange}
                          className={selectClasses}
                        >
                          <option value="">Select a product</option>
                          {productOptions.map((product) => (
                            <option key={product} value={product}>
                              {product}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M3 4.5L6 7.5L9 4.5" stroke="#96958D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                      {errors.products && (
                        <p className="mt-1.5 text-[12px] text-[#c0392b]">
                          {errors.products}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 4: Quantity */}
                  <div>
                    <label
                      htmlFor="quantity"
                      className="block text-[12px] font-medium text-[#6F6F69] mb-2"
                    >
                      Estimated Quantity
                    </label>
                    <input
                      id="quantity"
                      name="quantity"
                      type="text"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="e.g. 100 towels / 50 bedsheets"
                      className={inputClasses}
                    />
                  </div>

                  {/* Row 5: Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-[12px] font-medium text-[#6F6F69] mb-2"
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your requirements, sizes, quantities or anything else we should know..."
                      rows={5}
                      className={`${inputClasses} !h-auto py-4 resize-none`}
                    />
                    {errors.message && (
                      <p className="mt-1.5 text-[12px] text-[#c0392b]">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Helper note */}
                  <p className="text-[12px] text-[#96958D] leading-[1.5]">
                    Tell us your required quantity and product type for more
                    accurate bulk pricing.
                  </p>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#171717] text-white px-8 h-[52px] rounded-full text-[14px] font-medium hover:bg-[#2a2a2a] transition-all duration-300 hover:-translate-y-[2px]"
                  >
                    Request a Bulk Quote
                    <ArrowRight
                      size={15}
                      strokeWidth={2}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
