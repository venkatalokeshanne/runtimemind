'use client';

/**
 * ============================================================================
 * IMAGE PLACEHOLDER COMPONENT
 * ============================================================================
 * 
 * A beautiful gradient placeholder matching the OG image style.
 * Used when posts/series don't have cover images.
 * 
 * ============================================================================
 */

/**
 * Generate consistent colors based on title hash
 */
function getColors(title = '') {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    const char = title.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const palettes = [
    { bg: 'from-indigo-200 to-purple-200', accent: '#818cf8', accent2: '#a78bfa', text: '#4338ca' },
    { bg: 'from-orange-200 to-amber-200', accent: '#fb923c', accent2: '#fbbf24', text: '#c2410c' },
    { bg: 'from-cyan-200 to-blue-200', accent: '#22d3ee', accent2: '#38bdf8', text: '#0e7490' },
    { bg: 'from-rose-200 to-pink-200', accent: '#fb7185', accent2: '#f472b6', text: '#be123c' },
    { bg: 'from-violet-200 to-purple-200', accent: '#a78bfa', accent2: '#c084fc', text: '#6d28d9' },
    { bg: 'from-blue-200 to-indigo-200', accent: '#60a5fa', accent2: '#818cf8', text: '#1d4ed8' },
    { bg: 'from-emerald-200 to-teal-200', accent: '#34d399', accent2: '#2dd4bf', text: '#047857' },
    { bg: 'from-pink-200 to-rose-200', accent: '#f472b6', accent2: '#fb7185', text: '#be185d' },
  ];
  
  return palettes[Math.abs(hash) % palettes.length];
}

/**
 * ImagePlaceholder Component
 * 
 * @param {Object} props
 * @param {string} props.title - Title to generate colors and display initial
 * @param {string} props.type - 'article' | 'series' | 'page'
 * @param {string} props.className - Additional classes
 * @param {boolean} props.showFullTitle - Show full title instead of initials (for big cards)
 */
export function ImagePlaceholder({ title = 'RuntimeMind', type = 'article', className = '', showFullTitle = false, hideInitial = false }) {
  // Ensure title is a string
  const titleStr = String(title || 'RuntimeMind').trim();
  const colors = getColors(titleStr);
  // Show up to 2 initials, both uppercase, fallback to 'RM' if empty
  let initial = 'RM';
  if (titleStr.length === 1) {
    initial = titleStr.charAt(0).toUpperCase();
  } else if (titleStr.length > 1) {
    initial = titleStr.slice(0, 2).toUpperCase();
  }
  
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} ${className}`}>
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(${colors.accent}20 1px, transparent 1px), linear-gradient(90deg, ${colors.accent}20 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}
      />
      
      {/* Gradient orbs */}
      <div 
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-50"
        style={{ background: colors.accent }}
      />
      <div 
        className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-3xl opacity-40"
        style={{ background: colors.accent2 }}
      />
      
      {/* Decorative shapes */}
      <div 
        className="absolute top-4 right-4 w-16 h-16 rounded-xl border-2 opacity-30 rotate-12"
        style={{ borderColor: colors.text }}
      />
      <div 
        className="absolute top-8 right-10 w-8 h-8 rounded-full border-2 opacity-25"
        style={{ borderColor: colors.text }}
      />
      
      {/* Logo and content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        {/* Logo SVG */}
        <svg
          viewBox="0 0 44 44"
          className="w-12 h-12 mb-3 opacity-90"
        >
          <defs>
            <linearGradient id={`inkFlow-${initial}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <path
            d="M8 36 C8 36 12 28 16 24 C20 20 18 14 22 10 C26 6 32 8 34 14 C36 20 32 24 28 28 C24 32 28 38 36 36"
            fill="none"
            stroke={`url(#inkFlow-${initial})`}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="38" cy="12" r="2.5" fill="#ec4899" />
          <circle cx="34" cy="6" r="1.5" fill="#8b5cf6" opacity="0.8" />
          <circle cx="40" cy="18" r="1.5" fill="#6366f1" opacity="0.7" />
          <circle cx="8" cy="36" r="3" fill={`url(#inkFlow-${initial})`} />
        </svg>
        
        {/* Title or initials */}
        {/* Show initials/title unless hideInitial is true */}
        {!hideInitial && (
          showFullTitle ? (
            <span
              className="text-2xl md:text-4xl font-bold tracking-tight text-center break-words max-w-full"
              style={{ color: colors.text, textShadow: `0 0 40px ${colors.accent}` }}
              title={titleStr}
            >
              {titleStr.length > 32 ? titleStr.slice(0, 29) + '…' : titleStr}
            </span>
          ) : (
            <span
              className="text-3xl font-bold tracking-tight"
              style={{ color: colors.text, textShadow: `0 0 40px ${colors.accent}` }}
            >
              {initial}
            </span>
          )
        )}
        
        {/* Type badge */}
        <span 
          className="mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border"
          style={{ color: colors.text, borderColor: `${colors.text}40` }}
        >
          {type}
        </span>
      </div>
    </div>
  );
}
