import type { Metadata } from "next";
import ContactHero from "@/components/contact/ContactHero";
import ContactInfoForm from "@/components/contact/ContactInfoForm";
import WhyContact from "@/components/contact/WhyContact";
import LocationSection from "@/components/contact/LocationSection";
import ContactCTA from "@/components/contact/ContactCTA";

export const metadata: Metadata = {
  title: "Contact DataTowel | Bulk Towel & Linen Supplier in Pakistan",
  description:
    "Contact DataTowel for premium cotton towels, bedsheets and linens supplied in bulk to hotels, restaurants, gyms, clinics and retailers across Pakistan.",
};

export default function ContactPage() {
  return (
    <main>
      <ContactHero />
      <ContactInfoForm />
      <WhyContact />
      <LocationSection />
      <ContactCTA />
    </main>
  );
}
