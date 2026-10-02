import React from 'react';
import './Button.css';

export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'dark'
  size = 'md', // 'sm' | 'md' | 'lg'
  href,
  onClick,
  className = '',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  type = 'button',
  ...props
}) {
  const buttonClass = `btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full-width' : ''} ${className}`.trim();

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="btn-icon btn-icon-left">{icon}</span>}
      <span className="btn-text">{children}</span>
      {icon && iconPosition === 'right' && <span className="btn-icon btn-icon-right">{icon}</span>}
    </>
  );

  if (href) {
    return (
      <a href={href} className={buttonClass} onClick={onClick} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={buttonClass} onClick={onClick} {...props}>
      {content}
    </button>
  );
}
