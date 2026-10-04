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
import { AnalyticsOverview } from './components/analytics/AnalyticsOverview';
import { useVisitorTracker } from './hooks/useVisitorTracker';
import { useRouter } from './hooks/useRouter';
import './App.css';

export default function App() {
  const { navigate, isAnalyticsRoute } = useRouter();

  // Automatically and silently track every page visit (IP, device, browser, time, location) into Firebase Firestore
  useVisitorTracker();

  // Render Analytics Dashboard only when explicitly navigating to /analytics/overview or /analytics
  if (isAnalyticsRoute) {
    return (
      <AnalyticsOverview onNavigateHome={() => navigate('/')} />
    );
  }

  // Clean public landing page (no visible analytics buttons or widgets)
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



