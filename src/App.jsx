import React from 'react';
import { Navbar } from './components/common/Navbar';
import { HeroSection } from './components/sections/HeroSection';
import { VideoShowcase } from './components/sections/VideoShowcase';
import { FeaturesSection } from './components/sections/FeaturesSection';
import { WhyHuaweiSection } from './components/sections/WhyHuaweiSection';
import { PackagesSection } from './components/sections/PackagesSection';
import { FAQSection } from './components/sections/FAQSection';
import { ContactSection } from './components/sections/ContactSection';
import { Footer } from './components/common/Footer';
import './App.css';

export default function App() {
  return (
    <div className="landing-page-root">
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <VideoShowcase />
        <FeaturesSection />
        <WhyHuaweiSection />
        <PackagesSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
