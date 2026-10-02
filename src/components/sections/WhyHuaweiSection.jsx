import React from 'react';
import { Users, TrendingUp, Monitor, Cpu } from 'lucide-react';
import { CONTENT } from '../../constants/content';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './WhyHuaweiSection.css';

export function WhyHuaweiSection() {
  const [sectionRef, isRevealed] = useScrollReveal({ threshold: 0.1 });

  const getWhyIcon = (iconName) => {
    switch (iconName) {
      case 'Users':
        return <Users size={24} />;
      case 'TrendingUp':
        return <TrendingUp size={24} />;
      case 'Monitor':
        return <Monitor size={24} />;
      case 'Cpu':
        return <Cpu size={24} />;
      default:
        return <Users size={24} />;
    }
  };

  return (
    <section id="why-huawei" className="section section-muted why-huawei-section" ref={sectionRef}>
      <div className="container">
        {/* Header */}
        <div className={`why-header text-center ${isRevealed ? 'is-revealed' : ''}`}>
          <span className="section-badge section-badge-pill">{CONTENT.whyHuawei.badge}</span>
          <h2 className="section-title">{CONTENT.whyHuawei.heading}</h2>
          <p className="section-description mx-auto">{CONTENT.whyHuawei.description}</p>
        </div>

        {/* 4 Benefit Blocks Grid */}
        <div className={`why-cards-grid ${isRevealed ? 'is-revealed' : ''}`}>
          {CONTENT.whyHuawei.items.map((item, idx) => (
            <div key={item.id} className={`why-card-item delay-${(idx + 1) * 100}`}>
              <div className="why-icon-bubble">
                {getWhyIcon(item.icon)}
              </div>
              <h3 className="why-card-title">{item.title}</h3>
              <p className="why-card-desc">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
