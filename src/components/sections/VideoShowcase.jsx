import React from 'react';
import { CONTENT } from '../../constants/content';
import { VideoPlayer } from '../common/VideoPlayer';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './VideoShowcase.css';

export function VideoShowcase() {
  const [sectionRef, isRevealed] = useScrollReveal({ threshold: 0.1 });

  return (
    <section id="video-showcase" className="section section-muted video-showcase-section" ref={sectionRef}>
      <div className="container">
        {/* Section Header */}
        <div className={`video-showcase-header text-center ${isRevealed ? 'is-revealed' : ''}`}>
          <span className="section-badge section-badge-pill">SEE IT IN ACTION</span>
          <h2 className="section-title">Explore IdeaHub B3 in Real-Time</h2>
          <p className="section-description mx-auto">
            Explore the product, accessories and key features before you buy. See how it elevates presentations and collaboration.
          </p>
        </div>

        {/* 2-Column Video Cards Grid */}
        <div className={`video-cards-grid ${isRevealed ? 'is-revealed' : ''}`}>
          {CONTENT.videos.map((vid, idx) => (
            <div key={vid.id} className={`video-card-item delay-${(idx + 1) * 200}`}>
              <VideoPlayer
                videoSrc={vid.videoSrc}
                poster={vid.poster}
                title={vid.title}
                subtitle={vid.subtitle}
                badge={vid.badge}
                description={vid.description}
                aspectRatio="16/10"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
