import React, { useState } from 'react';

/**
 * Robust Image component that gracefully displays premium SVG/CSS placeholders
 * if the target image is not yet placed in the assets folder.
 */
export function SafeImage({
  src,
  alt = '',
  className = '',
  fallbackType = 'generic',
  width,
  height,
  priority = false,
  ...props
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`safe-image-placeholder placeholder-${fallbackType} ${className}`}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : 'auto',
          aspectRatio: width && height ? `${width}/${height}` : 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0F172A',
          color: '#94A3B8',
          borderRadius: '12px',
          overflow: 'hidden',
          padding: '1.5rem',
          textAlign: 'center',
        }}
        role="img"
        aria-label={alt || 'Image preview'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(237, 27, 36, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ED1B24',
              fontWeight: 'bold',
            }}
          >
            HD
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#E2E8F0' }}>
            {alt || 'IdeaHub Visual'}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Asset loaded from {src}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
