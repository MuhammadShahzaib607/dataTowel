import type { Metadata } from "next";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions | DataTowel",
  description:
    "Read the terms and conditions that apply to using the DataTowel website, product inquiries and bulk orders.",
};

const sections = [
  {
    id: "about-these-terms",
    number: "01",
    title: "About These Terms",
    content: `These terms and conditions govern your use of the DataTowel website and your interactions with us relating to our products, services, inquiries and bulk orders. By using our website, you agree to these terms.`,
  },
  {
    id: "use-of-our-website",
    number: "02",
    title: "Use of Our Website",
    content: `You may use our website only for lawful purposes and in accordance with these terms. You agree not to:

• Misuse the website or attempt to disrupt its operation
• Attempt unauthorized access to any part of the website
• Interfere with or impair the website's functionality
• Submit false, misleading or fraudulent information
• Use website content for any unlawful or unauthorized purpose`,
  },
  {
    id: "products-and-information",
    number: "03",
    title: "Products & Information",
    content: `Product descriptions, images, colors, dimensions, GSM weights, availability and other details shown on our website are provided for general information purposes.

Textile products may vary slightly between batches. Reasonable variations in color, texture and dimensions may occur due to the nature of cotton manufacturing and dyeing processes.

Final product specifications should be confirmed through a formal quotation or order confirmation from DataTowel.`,
  },
  {
    id: "pricing-and-bulk-orders",
    number: "04",
    title: "Pricing & Bulk Orders",
    content: `Prices displayed on our website may be starting prices or indicative prices for individual products.

Bulk pricing depends on several factors, including:

• Product type and specifications
• Order quantity
• Material and GSM requirements
• Current availability
• Delivery destination and logistics

A final price will be confirmed by DataTowel before any order is finalized. Displayed prices do not constitute a binding offer.`,
  },
  {
    id: "quotations-and-orders",
    number: "05",
    title: "Quotations & Orders",
    content: `Submitting an inquiry or request through our website does not automatically create a confirmed order.

An order becomes confirmed only after DataTowel communicates acceptance and all required commercial details, including pricing, specifications, quantities and delivery terms, have been agreed upon by both parties.`,
  },
  {
    id: "payments",
    number: "06",
    title: "Payments",
    content: `Payment terms, required deposits and accepted payment methods may vary depending on the order. These details will be communicated during the quotation and order process.

DataTowel reserves the right to adjust payment terms based on order size, credit history and other relevant factors.`,
  },
  {
    id: "delivery",
    number: "07",
    title: "Delivery",
    content: `Delivery timelines may depend on order size, product availability, destination and logistics arrangements.

Any delivery estimate provided by DataTowel should be treated as an approximate timeframe unless explicitly confirmed as a guaranteed delivery date in writing.`,
  },
  {
    id: "returns-and-exchanges",
    number: "08",
    title: "Returns & Exchanges",
    content: `Returns and exchanges are handled according to DataTowel's applicable return policy and the specific terms agreed for each order.

For questions about returns or exchanges, please contact us at:

Email: datatowel@gmail.com`,
  },
  {
    id: "intellectual-property",
    number: "09",
    title: "Intellectual Property",
    content: `All content on the DataTowel website, including branding, logos, photographs, text, graphics, layout and design, is protected by applicable intellectual property laws.

You may not copy, reproduce, distribute or create derivative works from our content without prior written permission, except where permitted by applicable law.`,
  },
  {
    id: "third-party-services",
    number: "10",
    title: "Third-Party Services & Links",
    content: `Our website may contain links to third-party websites or integrate third-party services. DataTowel is not responsible for the content, availability or practices of external websites or services.

Accessing third-party links is at your own discretion.`,
  },
  {
    id: "limitation-of-liability",
    number: "11",
    title: "Limitation of Liability",
    content: `To the extent permitted by applicable law, DataTowel shall not be liable for any indirect, incidental, special or consequential losses arising from your use of or reliance on our website, products or services.

Our total liability for any claim arising from the use of our website shall not exceed the amount you paid to DataTowel, if any, for the specific transaction giving rise to the claim.`,
  },
  {
    id: "changes-to-these-terms",
    number: "12",
    title: "Changes to These Terms",
    content: `DataTowel may update these terms from time to time. When changes are made, the "Last updated" date at the top of this page will be revised. Continued use of the website after changes are posted constitutes acceptance of the updated terms.`,
  },
  {
    id: "governing-law",
    number: "13",
    title: "Governing Law",
    content: `These terms are intended to be governed by and construed in accordance with the applicable laws of Pakistan, subject to any overriding legal requirements.`,
  },
  {
    id: "contact-us",
    number: "14",
    title: "Contact Us",
    content: `If you have any questions about these Terms & Conditions, please contact us.`,
    isContact: true,
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPageLayout
      eyebrow="DATATOWEL"
      title="Terms & Conditions"
      description="These terms explain the general rules for using the DataTowel website and communicating with us about products, inquiries and bulk orders."
      lastUpdated="August 2026"
      sections={sections}
      contactEmail="datatowel@gmail.com"
      contactPhone="+92 340 3004439"
      contactLocation="Karachi, Pakistan"
    />
  );
}
