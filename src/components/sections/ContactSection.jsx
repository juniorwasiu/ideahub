import React from 'react';
import { Phone, MessageCircle, Users, TrendingUp, Monitor, Cpu } from 'lucide-react';
import { ASSETS } from '../../constants/assets';
import { CONTENT } from '../../constants/content';
import { Button } from '../common/Button';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './ContactSection.css';

export function ContactSection() {
  const [sectionRef, isRevealed] = useScrollReveal({ threshold: 0.1 });

  return (
    <section id="contact" className="section section-dark contact-section" ref={sectionRef}>
      {/* Background Image with Dark Navy Corporate Overlay */}
      <div className="contact-bg-wrapper">
        <img
          src={ASSETS.contactBackground}
          alt="Modern Executive Meeting Room"
          className="contact-bg-image"
          loading="lazy"
        />
        <div className="contact-bg-overlay" />
      </div>

      <div className="container contact-container">
        <div className={`contact-layout-grid ${isRevealed ? 'is-revealed' : ''}`}>
          {/* Left Column: Heading & Value Icons */}
          <div className="contact-left-col">
            <span className="contact-top-label">{CONTENT.contact.badge}</span>
            <h2 className="contact-main-heading">{CONTENT.contact.heading}</h2>

            {/* 4 Mini Benefit Pillars */}
            <div className="contact-benefits-bar">
              <div className="contact-benefit-cell">
                <Users size={22} className="benefit-cell-icon" />
                <span className="benefit-cell-title">Better Collaboration</span>
              </div>
              <div className="contact-benefit-divider" />

              <div className="contact-benefit-cell">
                <TrendingUp size={22} className="benefit-cell-icon" />
                <span className="benefit-cell-title">Increased Productivity</span>
              </div>
              <div className="contact-benefit-divider" />

              <div className="contact-benefit-cell">
                <Monitor size={22} className="benefit-cell-icon" />
                <span className="benefit-cell-title">Modern Workspace</span>
              </div>
              <div className="contact-benefit-divider" />

              <div className="contact-benefit-cell">
                <Cpu size={22} className="benefit-cell-icon" />
                <span className="benefit-cell-title">Future-Ready Technology</span>
              </div>
            </div>
          </div>

          {/* Right Column: Direct Contact & WhatsApp Cards */}
          <div className="contact-right-col">
            <div className="contact-action-card">
              <h3 className="contact-script-title">{CONTENT.contact.ctaTitle}</h3>
              <p className="contact-subtitle">{CONTENT.contact.ctaSubtitle}</p>

              {/* Direct Phone Cards for Bashir & Jaey */}
              <div className="contact-phones-row">
                {CONTENT.contact.reps.map((rep) => (
                  <a
                    key={rep.name}
                    href={rep.phoneTel}
                    className="rep-contact-pill"
                    aria-label={`Call ${rep.name} at ${rep.phoneDisplay}`}
                  >
                    <div className="rep-phone-icon-box">
                      <Phone size={18} className="rep-phone-svg" />
                    </div>
                    <div className="rep-info-text">
                      <span className="rep-name-label">{rep.name}</span>
                      <span className="rep-phone-digits">{rep.phoneDisplay}</span>
                    </div>
                  </a>
                ))}
              </div>

              {/* Main WhatsApp Direct Purchase CTA Button */}
              <div className="contact-whatsapp-wrap">
                <Button
                  href={CONTENT.contact.mainWhatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={<MessageCircle size={22} />}
                  iconPosition="left"
                  className="contact-whatsapp-btn"
                >
                  {CONTENT.contact.mainWhatsappText}
                </Button>
              </div>

              {/* Script Partner Tagline */}
              <p className="contact-partner-tagline" aria-label="Your Smart Workspace Partner">
                {CONTENT.brand.partnerTagline}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
