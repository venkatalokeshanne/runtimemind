/**
 * ============================================================================
 * OPEN GRAPH IMAGE GENERATOR - ULTRA MODERN DESIGN
 * ============================================================================
 * 
 * Generates dynamic, ultra-modern placeholder images based on title.
 * Features: Glassmorphism, gradient meshes, geometric patterns, depth
 * 
 * Usage: /api/og?title=My%20Article%20Title&type=article
 * 
 * ============================================================================
 */

import { ImageResponse } from 'next/og';

export const runtime = 'edge';

/**
 * Generate colors based on the title hash
 * Beautiful modern color palettes with depth
 */
function getColors(title) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    const char = title.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  // Ultra-modern dark palettes with vibrant accents
  const palettes = [
    { bg: '#0f0f23', accent1: '#6366f1', accent2: '#a855f7', accent3: '#ec4899', glow: '#818cf8' },
    { bg: '#0a0a0a', accent1: '#f97316', accent2: '#fb923c', accent3: '#fbbf24', glow: '#fdba74' },
    { bg: '#0c1222', accent1: '#0ea5e9', accent2: '#06b6d4', accent3: '#22d3ee', glow: '#7dd3fc' },
    { bg: '#0f172a', accent1: '#f43f5e', accent2: '#fb7185', accent3: '#fda4af', glow: '#fda4af' },
    { bg: '#030712', accent1: '#8b5cf6', accent2: '#a78bfa', accent3: '#c4b5fd', glow: '#c4b5fd' },
    { bg: '#0f172a', accent1: '#3b82f6', accent2: '#60a5fa', accent3: '#93c5fd', glow: '#93c5fd' },
    { bg: '#0d0d0d', accent1: '#10b981', accent2: '#34d399', accent3: '#6ee7b7', glow: '#6ee7b7' },
    { bg: '#18181b', accent1: '#f472b6', accent2: '#f9a8d4', accent3: '#fbcfe8', glow: '#f9a8d4' },
  ];
  
  return palettes[Math.abs(hash) % palettes.length];
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const title = searchParams.get('title') || 'RuntimeMind';
    const type = searchParams.get('type') || 'article';
    const author = searchParams.get('author') || '';
    
    // Generate hash for consistent styling
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = ((hash << 5) - hash) + title.charCodeAt(i);
    }
    
    const colors = getColors(title);
    
    // Truncate title if too long
    const displayTitle = title.length > 65 ? title.substring(0, 62) + '...' : title;
    
    // Generate shape positions based on hash
    const shapes = [
      { x: 70 + (hash % 20), y: -10 + (hash % 15), size: 500, blur: 100 },
      { x: -10 + (hash % 10), y: 60 + (hash % 20), size: 400, blur: 120 },
      { x: 40 + (hash % 15), y: 30 + (hash % 10), size: 300, blur: 80 },
    ];
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            background: colors.bg,
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          {/* Gradient mesh orbs */}
          {shapes.map((shape, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${shape.x}%`,
                top: `${shape.y}%`,
                width: `${shape.size}px`,
                height: `${shape.size}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${i === 0 ? colors.accent1 : i === 1 ? colors.accent2 : colors.accent3}${i === 0 ? '50' : i === 1 ? '35' : '25'} 0%, transparent 70%)`,
                filter: `blur(${shape.blur}px)`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
          
          {/* Subtle grid pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(${colors.accent1}08 1px, transparent 1px),
                linear-gradient(90deg, ${colors.accent1}08 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
          
          {/* Floating geometric elements */}
          <div
            style={{
              position: 'absolute',
              top: '15%',
              right: '10%',
              width: '120px',
              height: '120px',
              border: `2px solid ${colors.accent1}30`,
              borderRadius: '24px',
              transform: 'rotate(15deg)',
              background: `linear-gradient(135deg, ${colors.accent1}10 0%, transparent 100%)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '25%',
              right: '18%',
              width: '80px',
              height: '80px',
              border: `2px solid ${colors.accent2}25`,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.accent2}08 0%, transparent 100%)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '20%',
              right: '5%',
              width: '160px',
              height: '160px',
              border: `1px solid ${colors.accent3}20`,
              borderRadius: '32px',
              transform: 'rotate(-10deg)',
            }}
          />
          
          {/* Decorative lines */}
          <div
            style={{
              position: 'absolute',
              top: '40%',
              left: '0',
              width: '200px',
              height: '1px',
              background: `linear-gradient(90deg, transparent 0%, ${colors.accent1}40 50%, transparent 100%)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '55%',
              left: '0',
              width: '120px',
              height: '1px',
              background: `linear-gradient(90deg, transparent 0%, ${colors.accent2}30 50%, transparent 100%)`,
            }}
          />
          
          {/* Content container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              padding: '56px 64px',
              zIndex: 10,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {/* Logo - Creative Ink Flow */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 44 44"
                  style={{ flexShrink: 0 }}
                >
                  <defs>
                    <linearGradient id="ogInkFlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M8 36 C8 36 12 28 16 24 C20 20 18 14 22 10 C26 6 32 8 34 14 C36 20 32 24 28 28 C24 32 28 38 36 36"
                    fill="none"
                    stroke="url(#ogInkFlow)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="38" cy="12" r="2.5" fill="#ec4899" />
                  <circle cx="34" cy="6" r="1.5" fill="#8b5cf6" opacity="0.8" />
                  <circle cx="40" cy="18" r="1.5" fill="#6366f1" opacity="0.7" />
                  <circle cx="8" cy="36" r="3" fill="url(#ogInkFlow)" />
                </svg>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: 'white',
                    letterSpacing: '-0.02em',
                  }}
                >
                  RuntimeMind
                </span>
              </div>
              
              {/* Type badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '100px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: colors.accent1,
                    boxShadow: `0 0 12px ${colors.accent1}, 0 0 24px ${colors.accent1}60`,
                  }}
                />
                <span
                  style={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '13px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                  }}
                >
                  {type === 'series' ? 'Series' : 'Article'}
                </span>
              </div>
            </div>
            
            {/* Main content */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '28px',
                maxWidth: '850px',
              }}
            >
              {/* Gradient accent bar */}
              <div
                style={{
                  width: '100px',
                  height: '5px',
                  borderRadius: '3px',
                  background: `linear-gradient(90deg, ${colors.accent1} 0%, ${colors.accent2} 50%, ${colors.accent3} 100%)`,
                  boxShadow: `0 0 30px ${colors.glow}60, 0 0 60px ${colors.glow}30`,
                }}
              />
              
              {/* Title */}
              <h1
                style={{
                  fontSize: displayTitle.length > 40 ? '54px' : '64px',
                  fontWeight: '800',
                  color: 'white',
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  margin: 0,
                  textShadow: `0 4px 30px rgba(0,0,0,0.4), 0 0 80px ${colors.glow}15`,
                }}
              >
                {displayTitle}
              </h1>
              
              {/* Author */}
              {author && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${colors.accent2} 0%, ${colors.accent3} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid rgba(255,255,255,0.15)',
                      boxShadow: `0 4px 20px ${colors.accent2}30`,
                    }}
                  >
                    <span style={{ color: 'white', fontSize: '18px', fontWeight: '700' }}>
                      {author.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span
                    style={{
                      color: 'rgba(255,255,255,0.75)',
                      fontSize: '18px',
                      fontWeight: '500',
                    }}
                  >
                    by {author}
                  </span>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              {/* Decorative dots */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: colors.accent1,
                    boxShadow: `0 0 8px ${colors.accent1}`,
                  }}
                />
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: colors.accent2,
                    boxShadow: `0 0 8px ${colors.accent2}`,
                  }}
                />
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: colors.accent3,
                    boxShadow: `0 0 8px ${colors.accent3}`,
                  }}
                />
              </div>
              
              {/* Gradient line */}
              <div
                style={{
                  flex: 1,
                  height: '1px',
                  background: `linear-gradient(90deg, ${colors.accent1}50 0%, ${colors.accent2}30 50%, transparent 100%)`,
                }}
              />
              
              {/* Year */}
              <span
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '13px',
                  fontWeight: '500',
                  letterSpacing: '0.05em',
                }}
              >
                {new Date().getFullYear()}
              </span>
            </div>
          </div>
          
          {/* Bottom corner glow */}
          <div
            style={{
              position: 'absolute',
              bottom: '-100px',
              right: '-100px',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${colors.accent1}20 0%, transparent 70%)`,
              filter: 'blur(60px)',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    
    // Fallback - still modern
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '20%',
              right: '20%',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #6366f140 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 44 44"
            >
              <defs>
                <linearGradient id="fbInkFlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <path
                d="M8 36 C8 36 12 28 16 24 C20 20 18 14 22 10 C26 6 32 8 34 14 C36 20 32 24 28 28 C24 32 28 38 36 36"
                fill="none"
                stroke="url(#fbInkFlow)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="38" cy="12" r="2.5" fill="#ec4899" />
              <circle cx="34" cy="6" r="1.5" fill="#8b5cf6" opacity="0.8" />
              <circle cx="40" cy="18" r="1.5" fill="#6366f1" opacity="0.7" />
              <circle cx="8" cy="36" r="3" fill="url(#fbInkFlow)" />
            </svg>
            <span
              style={{
                fontSize: '64px',
                fontWeight: '800',
                color: 'white',
                letterSpacing: '-0.03em',
              }}
            >
              RuntimeMind
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
