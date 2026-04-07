import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
