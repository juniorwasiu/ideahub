import React from 'react';
import { Edit3, Tv, Camera, Wifi, Users, Play, ArrowRight } from 'lucide-react';
import { ASSETS } from '../../constants/assets';
import { CONTENT } from '../../constants/content';
import { Button } from '../common/Button';
import { SafeImage } from '../common/SafeImage';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './HeroSection.css';

export function HeroSection() {
  const [heroRef, isRevealed] = useScrollReveal({ threshold: 0.05 });

  const getFeatureIcon = (iconName) => {
    switch (iconName) {
      case 'Edit3':
        return <Edit3 size={18} />;
      case 'Tv':
        return <Tv size={18} />;
      case 'Camera':
        return <Camera size={18} />;
      case 'Wifi':
        return <Wifi size={18} />;
      case 'Users':
        return <Users size={18} />;
      default:
        return <Edit3 size={18} />;
    }
  };

  return (
    <section id="home" className="hero-section" ref={heroRef}>
      <div className="container hero-container">
        <div className={`hero-grid ${isRevealed ? 'is-revealed' : ''}`}>
          {/* Left Column: Information & Pricing */}
          <div className="hero-content-col">
            {/* Red Badge */}
            <div className="hero-badge-wrap">
              <span className="hero-brand-badge">{CONTENT.hero.badge}</span>
            </div>

            {/* Main Single H1 Heading */}
            <h1 className="hero-title">
              {CONTENT.hero.titleMain} <span className="hero-title-red">{CONTENT.hero.titleModel}</span>
            </h1>

            {/* Supporting Heading */}
            <h2 className="hero-subtitle">{CONTENT.hero.subtitle}</h2>

            {/* Description */}
            <p className="hero-description">{CONTENT.hero.description}</p>

            {/* 5 Feature Mini Highlights Cards */}
            <div className="hero-highlights-row" role="list">
              {CONTENT.hero.highlights.map((item) => (
                <div key={item.id} className="hero-highlight-card" role="listitem">
                  <div className="highlight-icon-box">{getFeatureIcon(item.icon)}</div>
                  <span className="highlight-label">{item.title}</span>
                </div>
              ))}
            </div>

            {/* Special Discount Banner */}
            <div className="hero-discount-banner">
              <div className="discount-brush-bg">
                <span className="discount-tagline">{CONTENT.pricing.discountLabel}</span>
                <div className="discount-price-main">{CONTENT.pricing.discountPrice}</div>
                <div className="discount-original-price">
                  Original Price: <span className="price-strikethrough">{CONTENT.pricing.originalPrice}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="hero-cta-group">
              <Button
                href="#contact"
                variant="primary"
                size="lg"
                icon={<ArrowRight size={19} />}
                iconPosition="right"
              >
                {CONTENT.hero.ctaPrimary}
              </Button>
              <Button
                href="#video-showcase"
                variant="secondary"
                size="lg"
                icon={<Play size={18} />}
                iconPosition="left"
              >
                {CONTENT.hero.ctaSecondary}
              </Button>
            </div>
          </div>

          {/* Right Column: Visual Product & Boardroom Presentation */}
          <div className="hero-visual-col">
            <div className="hero-visual-frame">
              <div className="hero-image-wrapper">
                <SafeImage
                  src={ASSETS.heroWorkspace}
                  alt="Huawei IdeaHub B3 65-inch Interactive Display in Executive Boardroom"
                  className="hero-main-photo"
                  priority={true}
                  fallbackType="hero"
                />

                {/* Script overlay matching reference design */}
                <div className="hero-floating-script" aria-hidden="true">
                  <span>Smarter Meetings</span>
                  <span className="script-indent">Bigger Ideas</span>
                </div>
              </div>

              {/* Glowing accent backdrop */}
              <div className="hero-visual-glow" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
