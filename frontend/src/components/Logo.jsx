// Logo.jsx - Custom FoodRescue vector brand mark & wordmark
import React from 'react';

export const LogoIcon = ({ size = 38, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`logo-svg ${className}`}
    style={{ minWidth: size, minHeight: size }}
  >
    <defs>
      <linearGradient id="frBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="60%" stopColor="#059669" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="frHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#EF4444" />
      </linearGradient>
      <linearGradient id="frLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
    </defs>

    {/* Background Rounded Squircle Badge */}
    <rect width="48" height="48" rx="13" fill="url(#frBrandGrad)" />

    {/* Inner subtle glow rim */}
    <rect x="1" y="1" width="46" height="46" rx="12" stroke="white" strokeOpacity="0.25" strokeWidth="1.2" />

    {/* Caring Hands / Shield Arc Embracing the Food */}
    <path
      d="M9 25C9 32.5 15 38 24 38C33 38 39 32.5 39 25"
      stroke="white"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeOpacity="0.5"
    />

    {/* Warm Nourishing Food Bowl */}
    <path
      d="M12 25C12 32.5 17.5 34.5 24 34.5C30.5 34.5 36 32.5 36 25L12 25Z"
      fill="white"
    />
    {/* Bowl Rim */}
    <path
      d="M10.5 24.5C10.5 23.6 11.4 23 12.5 23H35.5C36.6 23 37.5 23.6 37.5 24.5C37.5 25.4 36.6 26 35.5 26H12.5C11.4 26 10.5 25.4 10.5 24.5Z"
      fill="white"
    />
    {/* Base Stand */}
    <path
      d="M18.5 34.5L17.5 37H30.5L29.5 34.5H18.5Z"
      fill="white"
      opacity="0.9"
    />

    {/* Compassion Heart Rising From The Meal (Rescue Symbol) */}
    <path
      d="M24 16.5C22.2 13.8 17.8 13.8 17.8 17.5C17.8 21.2 24 24 24 24C24 24 30.2 21.2 30.2 17.5C30.2 13.8 25.8 13.8 24 16.5Z"
      fill="url(#frHeartGrad)"
    />

    {/* Freshness / Eco Sprout Leaves */}
    <path
      d="M27.5 12C27.5 12 31.5 12 32 15C30.5 16 28 15 27.5 12Z"
      fill="url(#frLeafGrad)"
    />
    <path
      d="M20.5 12C20.5 12 16.5 12 16 15C17.5 16 20 15 20.5 12Z"
      fill="#A7F3D0"
      opacity="0.85"
    />
  </svg>
);

const Logo = ({
  size = 'md',
  variant = 'default',
  showText = true,
  className = '',
  style = {}
}) => {
  const pixelSizes = {
    sm: 30,
    md: 38,
    lg: 46
  };

  const iconPx = typeof size === 'number' ? size : pixelSizes[size] || 38;

  const textClasses = {
    default: 'nav-logo-text',
    light: 'nav-logo-text nav-logo-text-light'
  };

  return (
    <div
      className={`nav-logo-brand ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.65rem',
        textDecoration: 'none',
        ...style
      }}
    >
      <LogoIcon size={iconPx} />
      {showText && (
        <span className={textClasses[variant] || textClasses.default}>
          <span className="logo-word-food">Food</span>
          <span className="logo-word-rescue">Rescue</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
