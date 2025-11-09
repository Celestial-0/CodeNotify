import { CTA } from "@/components/core/landing/cta";
import { Features } from "@/components/core/landing/features";
import { Footer } from "@/components/core/landing/footer";
import { Hero } from "@/components/core/landing/hero";
import { Navbar } from "@/components/core/landing/navbar";
import { PlatformShowcase } from "@/components/core/landing/platform-showcase";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <PlatformShowcase />
      <CTA />
      <Footer />
    </main>
  );
}
