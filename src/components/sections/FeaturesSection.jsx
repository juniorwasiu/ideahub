import React from 'react';
import { PenSquare, Camera, Cast, Users2, ShieldCheck, ArrowRight } from 'lucide-react';
import { CONTENT } from '../../constants/content';
import { Button } from '../common/Button';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './FeaturesSection.css';

export function FeaturesSection() {
  const [sectionRef, isRevealed] = useScrollReveal({ threshold: 0.1 });

  const getFeatureIcon = (iconName) => {
    switch (iconName) {
      case 'PenSquare':
        return <PenSquare size={24} className="feature-icon-svg" />;
      case 'Tv2':
        return (
          <div className="icon-4k-badge">
            <span>4K</span>
          </div>
        );
      case 'Camera':
        return <Camera size={24} className="feature-icon-svg" />;
      case 'Cast':
        return <Cast size={24} className="feature-icon-svg" />;
      case 'Users2':
        return <Users2 size={24} className="feature-icon-svg" />;
      case 'ShieldCheck':
        return <ShieldCheck size={24} className="feature-icon-svg" />;
      default:
        return <PenSquare size={24} className="feature-icon-svg" />;
    }
  };

  return (
    <section id="features" className="section section-light features-section" ref={sectionRef}>
      <div className="container">
        <div className={`features-layout-grid ${isRevealed ? 'is-revealed' : ''}`}>
          {/* Left Intro Column */}
          <div className="features-intro-col">
            <span className="section-badge section-badge-pill">{CONTENT.features.badge}</span>
            <h2 className="section-title">{CONTENT.features.heading}</h2>
            <p className="section-description">{CONTENT.features.description}</p>
            <div className="features-cta-wrap">
              <Button
                href="#contact"
                variant="primary"
                size="lg"
                icon={<ArrowRight size={19} />}
                iconPosition="right"
              >
                {CONTENT.features.cta}
              </Button>
            </div>
          </div>

          {/* Right 2x3 Grid Column */}
          <div className="features-cards-grid">
            {CONTENT.features.items.map((item, idx) => (
              <div
                key={item.id}
                className={`feature-card-item delay-${((idx % 3) + 1) * 100}`}
              >
                <div className="feature-card-icon-box">
                  {getFeatureIcon(item.icon)}
                </div>
                <h3 className="feature-card-title">{item.title}</h3>
                <p className="feature-card-desc">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
