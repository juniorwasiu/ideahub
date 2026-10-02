import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { ASSETS } from '../../constants/assets';
import { CONTENT } from '../../constants/content';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import './Navbar.css';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sectionIds = ['home', 'features', 'packages', 'why-huawei', 'contact'];
  const activeSection = useScrollSpy(sectionIds, 100);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={`navbar-wrapper ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-container">
        {/* Left Branding: Huawei */}
        <a href="#home" className="navbar-brand-link" aria-label="Huawei IdeaHub B3 Home">
          <img
            src={ASSETS.huaweiLogo}
            alt="HUAWEI"
            className="navbar-brand-logo huawei-logo"
            width="140"
            height="36"
          />
        </a>

        {/* Center Desktop Navigation */}
        <nav className="navbar-desktop-nav" aria-label="Main Navigation">
          <ul className="navbar-links-list">
            {CONTENT.navLinks.map((link) => {
              const sectionId = link.href.replace('#', '');
              const isActive = activeSection === sectionId;

              return (
                <li key={link.name} className="navbar-link-item">
                  <a
                    href={link.href}
                    className={`navbar-link ${isActive ? 'is-active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.name}
                    {isActive && <span className="nav-active-indicator" />}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right Branding: TDAfrica */}
        <div className="navbar-right-group">
          <div className="navbar-partner-logo-box" title="Authorized Distributor">
            <img
              src={ASSETS.tdafricaLogo}
              alt="TDAfrica ...Empowering You"
              className="navbar-brand-logo tdafrica-logo"
              width="130"
              height="36"
            />
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <div
        id="mobile-nav-drawer"
        className={`mobile-nav-drawer ${mobileMenuOpen ? 'is-open' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="mobile-nav-backdrop" onClick={() => setMobileMenuOpen(false)} />
        <div className="mobile-nav-panel">
          <div className="mobile-nav-header">
            <img
              src={ASSETS.huaweiLogo}
              alt="HUAWEI"
              className="navbar-brand-logo"
              width="120"
              height="30"
            />
            <button
              type="button"
              className="mobile-close-btn"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close Navigation"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="mobile-nav-links" aria-label="Mobile Navigation">
            {CONTENT.navLinks.map((link) => {
              const sectionId = link.href.replace('#', '');
              const isActive = activeSection === sectionId;

              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={`mobile-nav-link ${isActive ? 'is-active' : ''}`}
                  onClick={handleLinkClick}
                >
                  <span>{link.name}</span>
                  {isActive && <span className="mobile-active-dot" />}
                </a>
              );
            })}
          </nav>

          <div className="mobile-nav-footer">
            <div className="mobile-partner-block">
              <span className="mobile-partner-label">Authorized Distributor</span>
              <img
                src={ASSETS.tdafricaLogo}
                alt="TDAfrica"
                className="navbar-brand-logo"
                width="120"
                height="32"
              />
            </div>
            <a
              href="#contact"
              className="btn btn-primary btn-md btn-full-width"
              onClick={handleLinkClick}
            >
              Get Yours Today
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
