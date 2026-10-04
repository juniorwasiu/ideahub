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
import { VisitorTelemetryWidget } from './components/common/VisitorTelemetryWidget';
import { AnalyticsOverview } from './components/analytics/AnalyticsOverview';
import { useVisitorTracker } from './hooks/useVisitorTracker';
import { useRouter } from './hooks/useRouter';
import './App.css';

export default function App() {
  const { navigate, isAnalyticsRoute } = useRouter();

  // Automatically track every page visit with full IP, device, browser, and timing telemetry
  const { visitorData, isTracking } = useVisitorTracker();

  if (isAnalyticsRoute) {
    return (
      <AnalyticsOverview onNavigateHome={() => navigate('/')} />
    );
  }

  return (
    <div className="landing-page-root">
      <Navbar onNavigateAnalytics={() => navigate('/analytics/overview')} />
      <main id="main-content">
        <HeroSection />
        <VideoShowcase />
        <FeaturesSection />
        <WhyHuaweiSection />
        <PackagesSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer onNavigateAnalytics={() => navigate('/analytics/overview')} />
      {/* Real-time Visitor Telemetry and Database Inspector */}
      <VisitorTelemetryWidget
        currentVisitorData={visitorData}
        isTracking={isTracking}
        onOpenFullAnalytics={() => navigate('/analytics/overview')}
      />
    </div>
  );
}


