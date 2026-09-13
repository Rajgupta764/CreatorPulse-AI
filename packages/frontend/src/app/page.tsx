"use client";

import HeroSection from "@/components/landing/hero-section";
import FeatureCard from "@/components/landing/feature-card";
import FeatureGrid from "@/components/landing/feature-grid";
import ProductShowcase from "@/components/landing/product-showcase";
import TestimonialCard from "@/components/landing/testimonial-card";
import TestimonialsGrid from "@/components/landing/testimonials-grid";
import Cta from "@/components/landing/cta";
import Footer from "@/components/landing/footer";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeatureCard />
      <FeatureGrid />
      <ProductShowcase />
      <TestimonialCard />
      <TestimonialsGrid />
      <Cta />
      <Footer />
    </main>
  );
}
