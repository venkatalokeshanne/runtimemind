/**
 * ============================================================================
 * SITE FOOTER COMPONENT
 * ============================================================================
 * 
 * Minimal footer with copyright and optional links.
 * 
 * DESIGN DECISIONS:
 * 
 * 1. MINIMAL CONTENT:
 *    Blog footers shouldn't compete with content.
 *    Just copyright, maybe social links, nothing more.
 * 
 * 2. SEMANTIC HTML:
 *    Uses <footer> element for proper document structure.
 * 
 * ============================================================================
 */

import Link from 'next/link';

/**
 * SiteFooter Component
 * 
 * @param {Object} props
 * @param {string} props.siteName - Blog name for copyright
 */
export function SiteFooter({ siteName = 'Ink' }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="border-t border-border bg-surface"
      role="contentinfo"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className="text-sm text-text-muted">
            © {currentYear} {siteName}. All rights reserved.
          </p>

          {/* Created by LinkedIn */}
          <p className="text-sm text-text-muted flex items-center gap-1">
            Created with <span className="text-red-500">♥</span> by
            <a
              href="https://www.linkedin.com/in/venkatalokesh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline ml-1"
            >
              venkatalokesh
            </a>
          </p>

          {/* Footer Links */}
          <nav aria-label="Footer navigation">
            <ul className="flex items-center gap-6 text-sm">
              <li>
                <Link 
                  href="/privacy"
                  className="text-text-muted hover:text-text-secondary transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link 
                  href="/rss"
                  className="text-text-muted hover:text-text-secondary transition-colors"
                >
                  RSS
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
