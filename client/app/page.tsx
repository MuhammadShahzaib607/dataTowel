import Navbar from "@/components/layout/Navbar";
import MobileMenu from "@/components/layout/MobileMenu";
import Hero from "@/components/home/Hero";
import Introduction from "@/components/home/Introduction";
import FeaturedCollection from "@/components/home/FeaturedCollection";
import EditorialSection from "@/components/home/EditorialSection";
import FeatureGrid from "@/components/home/FeatureGrid";
import TextureSection from "@/components/home/TextureSection";
import VideoSection from "@/components/home/VideoSection";
import Bestsellers from "@/components/home/Bestsellers";
import BrandStory from "@/components/home/BrandStory";
import Testimonials from "@/components/home/Testimonials";
import InstagramGrid from "@/components/home/InstagramGrid";
import Newsletter from "@/components/home/Newsletter";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <MobileMenu />
      <main>
        <Hero />
        <Introduction />
        <FeaturedCollection />
        <EditorialSection />
        <FeatureGrid />
        <TextureSection />
        <VideoSection />
        <Bestsellers />
        <BrandStory />
        <Testimonials />
        <InstagramGrid />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
