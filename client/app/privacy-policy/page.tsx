import type { Metadata } from "next";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | DataTowel",
  description:
    "Learn how DataTowel collects, uses and protects information when you use our website and services.",
};

const sections = [
  {
    id: "information-we-collect",
    number: "01",
    title: "Information We Collect",
    content: `DataTowel collects information that you voluntarily provide when you interact with our website, submit an inquiry form, or communicate with us directly. This may include:

• Full name
• Business name
• Email address
• Phone number
• Product requirements and preferences
• Order or inquiry details
• Any other information you choose to share

When you visit our website, certain technical information may be collected automatically. This can include browser type, device type, approximate location, pages visited, and general usage patterns. This information helps us understand how our website is used and how we can improve it.`,
  },
  {
    id: "how-we-use-information",
    number: "02",
    title: "How We Use Information",
    content: `DataTowel may use the information we collect to:

• Respond to your inquiries and provide product information
• Prepare bulk quotations and pricing details
• Communicate about orders, deliveries and account matters
• Improve our website, products and services
• Understand how visitors use our website
• Provide customer support
• Maintain the security and functionality of our website`,
  },
  {
    id: "information-sharing",
    number: "03",
    title: "Information Sharing",
    content: `DataTowel does not sell your personal information to third parties.

We may share information when it is reasonably necessary to:

• Provide the products or services you have requested
• Operate and maintain our website infrastructure
• Comply with applicable legal obligations
• Protect the rights, safety or security of DataTowel, our customers or others

We do not share your information with third parties for their independent marketing purposes without your explicit consent.`,
  },
  {
    id: "cookies",
    number: "04",
    title: "Cookies & Similar Technologies",
    content: `Our website may use cookies and similar technologies to help understand how visitors interact with our pages. Cookies are small files stored on your device that help us improve website performance and user experience.

You can typically control cookies through your browser settings. Disabling certain cookies may affect how some parts of the website function.`,
  },
  {
    id: "data-security",
    number: "05",
    title: "Data Security",
    content: `DataTowel uses reasonable technical and organizational measures to protect the information we collect. While we take steps to safeguard your data, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.`,
  },
  {
    id: "data-retention",
    number: "06",
    title: "Data Retention",
    content: `We retain your personal information only for as long as reasonably necessary to fulfill the purposes for which it was collected, or as required by applicable law. When information is no longer needed, we take steps to delete or anonymize it.`,
  },
  {
    id: "your-choices",
    number: "07",
    title: "Your Choices",
    content: `You have the right to access, correct or request deletion of your personal information. If you have questions about how your information is used, or if you would like to make a request regarding your data, please contact us at:

Email: datatowel@gmail.com
Phone: +92 340 3004439`,
  },
  {
    id: "third-party-links",
    number: "08",
    title: "Third-Party Links",
    content: `Our website may contain links to third-party websites or services. DataTowel is not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party websites you visit.`,
  },
  {
    id: "childrens-privacy",
    number: "09",
    title: "Children's Privacy",
    content: `The DataTowel website is intended for businesses and general audiences. It is not directed toward children under the age of 13, and we do not knowingly collect personal information from children. If we learn that we have collected information from a child, we will take steps to delete it promptly.`,
  },
  {
    id: "changes-to-this-policy",
    number: "10",
    title: "Changes to This Policy",
    content: `DataTowel may update this Privacy Policy from time to time. When changes are made, the "Last updated" date at the top of this page will be revised. We encourage you to review this policy periodically to stay informed about how we protect your information.`,
  },
  {
    id: "contact-us",
    number: "11",
    title: "Contact Us",
    content: `If you have any questions about this Privacy Policy or how DataTowel handles your information, please reach out to us.`,
    isContact: true,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      eyebrow="DATATOWEL"
      title="Privacy Policy"
      description="Your privacy matters to us. This policy explains what information DataTowel collects, how we use it, and how we protect it when you interact with our website and services."
      lastUpdated="August 2026"
      sections={sections}
      contactEmail="datatowel@gmail.com"
      contactPhone="+92 340 3004439"
      contactLocation="Karachi, Pakistan"
    />
  );
}
