import React from 'react';
import { ShieldCheck, Headset, Award, Truck } from 'lucide-react';
import { ASSETS } from '../../constants/assets';
import { CONTENT } from '../../constants/content';
import './Footer.css';

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  const getTrustIcon = (iconName) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck size={20} className="trust-icon-svg" />;
      case 'Headset':
        return <Headset size={20} className="trust-icon-svg" />;
      case 'Award':
        return <Award size={20} className="trust-icon-svg" />;
      case 'Truck':
        return <Truck size={20} className="trust-icon-svg" />;
      default:
        return <ShieldCheck size={20} className="trust-icon-svg" />;
    }
  };

  return (
    <footer className="footer-wrapper">
      {/* Curved Divider Header */}
      <div className="footer-curve-container">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="footer-curve-svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 0 C 480 50, 960 50, 1440 0 L 1440 60 L 0 60 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      <div className="container footer-container">
        {/* Top Row: Logos & Trust Indicators */}
        <div className="footer-top-row">
          {/* Brand & Partner Logos */}
          <div className="footer-logos-group">
            <a href="#home" className="footer-brand-logo-link" aria-label="Huawei">
              <img
                src={ASSETS.huaweiLogo}
                alt="HUAWEI"
                className="footer-logo huawei-footer-logo"
                width="140"
                height="36"
              />
            </a>
            <div className="footer-logo-separator" />
            <div className="footer-partner-logo-wrap">
              <img
                src={ASSETS.tdafricaLogo}
                alt="TDAfrica ...Empowering You"
                className="footer-logo tdafrica-footer-logo"
                width="130"
                height="36"
              />
            </div>
          </div>

          {/* Trust Badges */}
          <div className="footer-trust-grid">
            {CONTENT.trustIndicators.map((item) => (
              <div key={item.title} className="trust-item">
                <div className="trust-icon-box">{getTrustIcon(item.icon)}</div>
                <span className="trust-text">{item.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Row: Navigation Links */}
        <div className="footer-nav-row">
          <ul className="footer-nav-list">
            {CONTENT.navLinks.map((link) => (
              <li key={link.name}>
                <a href={link.href} className="footer-nav-link">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Row: Copyright & Disclaimers */}
        <div className="footer-bottom-row">
          <p className="footer-copyright">
            © {CURRENT_YEAR} Huawei IdeaHub Nigeria. Official Promotion & Distribution by TD Africa. All rights reserved.
          </p>
          <p className="footer-disclaimer">
            Huawei and IdeaHub are registered trademarks of Huawei Technologies Co., Ltd.
          </p>
        </div>
      </div>
    </footer>
  );
}
