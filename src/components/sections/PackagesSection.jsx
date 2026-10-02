import React from 'react';
import { CheckCircle2, Truck } from 'lucide-react';
import { ASSETS } from '../../constants/assets';
import { CONTENT } from '../../constants/content';
import { SafeImage } from '../common/SafeImage';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './PackagesSection.css';

export function PackagesSection() {
  const [sectionRef, isRevealed] = useScrollReveal({ threshold: 0.1 });

  return (
    <section id="packages" className="section section-dark packages-section" ref={sectionRef}>
      <div className="container">
        <div className={`packages-grid ${isRevealed ? 'is-revealed' : ''}`}>
          {/* Left Column: Package Inclusions */}
          <div className="package-col package-col-left">
            <div className="package-badge-header">
              <span className="package-red-line" />
              <span className="package-badge-text">{CONTENT.packages.badge}</span>
            </div>

            <h2 className="package-main-heading">
              {CONTENT.packages.heading}
              <span className="package-size-heading">{CONTENT.packages.subheading}</span>
            </h2>

            <ul className="package-checklist" role="list">
              {CONTENT.packages.includes.map((item, idx) => (
                <li key={idx} className="package-check-item">
                  <CheckCircle2 size={20} className="package-check-icon" />
                  <span className="package-check-label">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Center Column: Stage Product & Accessories Visual */}
          <div className="package-col package-col-center">
            <div className="package-visual-stage">
              <SafeImage
                src={ASSETS.packageImage}
                alt="Huawei IdeaHub B3 65-inch Complete Package with OPS i5 and Accessories"
                className="package-product-image"
                fallbackType="package"
              />
              <div className="package-stage-glow" />
            </div>
          </div>

          {/* Right Column: Terms & Pickup Badge */}
          <div className="package-col package-col-right">
            <div className="package-terms-box">
              <h3 className="package-terms-title">T&Cs</h3>
              <ul className="package-terms-list" role="list">
                {CONTENT.packages.terms.map((term, idx) => (
                  <li key={idx} className="package-check-item">
                    <CheckCircle2 size={20} className="package-check-icon" />
                    <span className="package-check-label">{term}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Red Immediate Pickup Splash Badge */}
            <div className="immediate-pickup-badge">
              <div className="pickup-content">
                <span className="pickup-line-1">AVAILABLE FOR</span>
                <span className="pickup-line-2">IMMEDIATE PICKUP</span>
                <div className="pickup-icon-wrap">
                  <Truck size={28} className="pickup-truck-svg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
