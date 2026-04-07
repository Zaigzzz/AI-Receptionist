import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import IntegrationLogos from "@/components/IntegrationLogos";
import PainPoints from "@/components/PainPoints";
import HowItWorks from "@/components/HowItWorks";
import FeaturesGrid from "@/components/FeaturesGrid";
import StatsSection from "@/components/StatsSection";
import Testimonials from "@/components/Testimonials";
import DemoCall from "@/components/DemoCall";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <IntegrationLogos />
      <PainPoints />
      <HowItWorks />
      <FeaturesGrid />
      <StatsSection />
      <Testimonials />
      <DemoCall />
      <Pricing />
      <FAQ />
      <CTABanner />
      <Footer />
    </main>
  );
}
