import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle } from 'lucide-react';
import './VideoPlayer.css';

export function VideoPlayer({
  videoSrc,
  poster,
  title,
  subtitle,
  badge,
  description,
  aspectRatio = '16/9',
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const videoRef = useRef(null);

  const handlePlayToggle = () => {
    if (hasVideoError || !videoSrc) return;

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn('Video playback notice:', err);
            setHasVideoError(true);
          });
      }
    }
  };

  const handleMuteToggle = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="video-card-container">
      <div
        className="video-card-frame"
        style={{ aspectRatio }}
        onClick={handlePlayToggle}
      >
        {/* Poster / Background Visual */}
        {poster && (
          <img
            src={poster}
            alt={title}
            className={`video-poster-img ${isPlaying ? 'video-poster-hidden' : ''}`}
            loading="lazy"
          />
        )}

        {/* Video Element (Real HTML5 Video) */}
        {!hasVideoError && videoSrc && (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={poster}
            playsInline
            controls={isPlaying}
            onEnded={() => setIsPlaying(false)}
            onError={() => setHasVideoError(true)}
            className={`video-native-element ${isPlaying ? 'is-playing' : ''}`}
          />
        )}

        {/* Overlay with Badges & Play Button */}
        <div className={`video-card-overlay ${isPlaying ? 'overlay-fade' : ''}`}>
          <div className="video-overlay-header">
            {badge && <span className="video-category-badge">{badge}</span>}
            {hasVideoError && (
              <span className="video-status-badge">
                <AlertCircle size={13} />
                Preview Mode
              </span>
            )}
          </div>

          <div className="video-play-center">
            <button
              className="video-play-button"
              aria-label={isPlaying ? 'Pause video' : `Play ${title}`}
              onClick={(e) => {
                e.stopPropagation();
                handlePlayToggle();
              }}
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} className="play-icon-offset" />}
            </button>
            <span className="video-play-hint">
              {hasVideoError ? 'Interactive Showcase' : isPlaying ? 'Click to Pause' : 'Click to Watch'}
            </span>
          </div>

          <div className="video-overlay-footer">
            <div className="video-text-details">
              <h3 className="video-title">{title}</h3>
              {subtitle && <p className="video-subtitle">{subtitle}</p>}
            </div>

            {isPlaying && (
              <div className="video-quick-actions">
                <button
                  type="button"
                  className="video-mini-btn"
                  onClick={handleMuteToggle}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button
                  type="button"
                  className="video-mini-btn"
                  onClick={handleFullscreen}
                  aria-label="Fullscreen"
                >
                  <Maximize size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {description && <p className="video-card-description">{description}</p>}
    </div>
  );
}
