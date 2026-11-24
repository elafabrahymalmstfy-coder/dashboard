import { useId } from 'react';

/**
 * ATECH — Automation Technology brand logo (inline SVG, theme-aware).
 *
 * variant="mark"       → the "A + circuit node" symbol only   (collapsed sidebar, favicon-like)
 * variant="horizontal" → symbol + "ATECH" wordmark            (sidebar expanded)
 * variant="full"       → symbol + wordmark + tagline           (login / about screens)
 *
 * Ink colors use CSS variables (--brand-ink / --brand-muted) so they
 * automatically switch between light and dark mode (see index.css).
 */
export default function BrandLogo({ variant = 'horizontal', className = '' }) {
  const uid = useId().replace(/:/g, '');
  const gradId = `atech-gradient-${uid}`;

  const gradient = (
    <linearGradient id={gradId} x1="0" y1="0" x2="0.15" y2="1">
      <stop offset="0" stopColor="#4EA8DE" />
      <stop offset="0.45" stopColor="#1F5A93" />
      <stop offset="1" stopColor="#102F4F" />
    </linearGradient>
  );

  // Symbol only: viewBox 0 0 112 96
  const mark = (
    <g>
      <path
        d="M10 76 L31 12 L44.5 12 L66 76"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.5 53 L54 53"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="7.5"
        strokeLinecap="round"
      />
      {/* circuit node: hexagon core with three traces ending in pads */}
      <path
        d="M82 38 L92.5 44 L92.5 58 L82 64.5 L71.5 58 L71.5 44 Z"
        fill="none"
        stroke="#2F7CC4"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      <path
        d="M82 38 L82 24 M71.5 58 L61 67.5 M92.5 58 L103 67.5"
        fill="none"
        stroke="#4EA8DE"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <circle cx="82" cy="20.5" r="4.6" fill="#4EA8DE" />
      <circle cx="57.5" cy="71.5" r="4.2" fill="#1F5A93" />
      <circle cx="106.5" cy="71.5" r="4.2" fill="#1F5A93" />
    </g>
  );

  const wordmark = (
    <text
      x="126"
      y="58"
      fontSize="38"
      fontWeight="800"
      letterSpacing="5"
      fill="var(--brand-ink)"
      fontFamily="'Inter','Cairo',Arial,'Helvetica Neue',sans-serif"
    >
      ATECH
    </text>
  );

  const tagline = (
    <text
      x="126"
      y="82"
      fontSize="12.5"
      fontWeight="600"
      letterSpacing="2.6"
      fill="var(--brand-muted)"
      fontFamily="'Inter','Cairo',Arial,'Helvetica Neue',sans-serif"
    >
      AUTOMATION TECHNOLOGY
    </text>
  );

  if (variant === 'mark') {
    return (
      <svg
        viewBox="0 0 112 96"
        role="img"
        aria-label="ATECH — Automation Technology"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>{gradient}</defs>
        {mark}
      </svg>
    );
  }

  if (variant === 'compact' || variant === 'horizontal') {
    return (
      <svg
        viewBox="0 0 252 96"
        role="img"
        aria-label="ATECH — Automation Technology"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        dir="ltr"
      >
        <defs>{gradient}</defs>
        {mark}
        {wordmark}
      </svg>
    );
  }

  // variant === 'full'
  return (
    <svg
      viewBox="0 0 420 96"
      role="img"
      aria-label="ATECH — Automation Technology"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      dir="ltr"
    >
      <defs>{gradient}</defs>
      {mark}
      {wordmark}
      {tagline}
    </svg>
  );
}
