import { systemDesignSlugMap } from './slugMapping';

// Load markdown files
const docFiles = import.meta.glob('/src/content/**/*.md', { query: '?raw', import: 'default', eager: true });

export async function loadDocContent(docId, slug) {
  // For system-design, load HTML files directly via fetch
  if (docId === 'system-design' && systemDesignSlugMap[slug]) {
    const htmlPath = systemDesignSlugMap[slug];
    const url = `/Grokking Modern System Design Interview for Engineers & Managers/${htmlPath}`;
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        const htmlText = await response.text();
        
        // Parse and clean the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        
        // Remove unwanted elements
        const selectorsToRemove = [
          'script',
          'nav',
          'header',
          'footer',
          '[class*="sidebar"]',
          '[class*="Sidebar"]',
          '[class*="navigation"]',
          '[class*="Navigation"]',
          '[id*="sidebar"]',
          '[id*="navigation"]',
          '[role="navigation"]',
          '.nav',
          '#nav',
          '[class*="menu"]',
          '[class*="Menu"]',
          'iframe',
          '[data-rmiz-btn-open]',
          '[data-rmiz-btn-close]',
          '[data-rmiz-btn-zoom]',
          '[data-rmiz-modal]',
          '[aria-label*="Zoom"]',
        ];
        
        selectorsToRemove.forEach(selector => {
          doc.querySelectorAll(selector).forEach(el => el.remove());
        });
        
        // Remove buttons that are NOT part of content (navigation, UI buttons)
        doc.querySelectorAll('button').forEach(button => {
          const ariaLabel = button.getAttribute('aria-label') || '';
          const className = button.className || '';
          const parent = button.parentElement;
          
          // Keep buttons that might be part of interactive content
          const isContentButton = parent && parent.closest('[class*="quiz"], [class*="exercise"], [class*="interactive"]');
          
          if (!isContentButton) {
            button.remove();
          }
        });
        
        // Remove only UI SVGs (icons, navigation), not content diagrams
        // Remove SVGs that are small (likely icons) or in buttons/nav
        doc.querySelectorAll('svg').forEach(svg => {
          const width = svg.getAttribute('width');
          const height = svg.getAttribute('height');
          const viewBox = svg.getAttribute('viewBox');
          const parent = svg.parentElement;
          
          // KEEP if: inside diagram containers
          const isInDiagram = parent && (
            parent.classList.contains('canvas-svg-viewmode') ||
            parent.closest('.canvas-svg-viewmode, .canvas-wrapper, [class*="diagram"]')
          );
          
          if (isInDiagram) {
            return; // Keep this SVG
          }
          
          // Remove if: small icon size, or in button/link/nav context
          const isSmallIcon = (width && parseInt(width) <= 48) || (height && parseInt(height) <= 48);
          const isInButton = parent && (parent.tagName === 'BUTTON' || parent.closest('button, a, nav'));
          const hasIconClass = svg.className && String(svg.className).match(/icon|logo|chevron|arrow/i);
          
          if (isSmallIcon || isInButton || hasIconClass) {
            svg.remove();
          }
        });
        
        // Find main content
        let content = doc.querySelector('article') || 
                      doc.querySelector('main') || 
                      doc.querySelector('[class*="content"]') ||
                      doc.querySelector('[class*="lesson"]') ||
                      doc.body;
        
        // Remove tracking pixels (1x1 images)
        content.querySelectorAll('img[width="1"][height="1"]').forEach(img => img.remove());
        
        // Remove "We'll cover the following" sections
        content.querySelectorAll('*').forEach(el => {
          if (el.textContent.trim().match(/^We'?ll cover the following/i)) {
            const nextEl = el.nextElementSibling;
            if (nextEl && (nextEl.tagName === 'UL' || nextEl.tagName === 'OL')) {
              nextEl.remove();
            }
            el.remove();
          }
        });
        
        // Remove navigation text at the end (Previous/Next article titles) - AGGRESSIVE
        const navTexts = ['Next', 'Previous', 'Mark as Completed', 'Report an Issue', 'Ask a Question', 'Back'];
        
        // First pass: Remove all elements containing navigation keywords
        content.querySelectorAll('*').forEach(el => {
          const text = el.textContent.trim();
          
          // Remove if starts with Next: or Previous:
          if (text.match(/^(Next|Previous):/i)) {
            el.remove();
            return;
          }
          
          // Remove if exactly matches nav text
          if (navTexts.some(navText => text === navText)) {
            const parent = el.parentElement;
            if (parent && parent.children.length <= 3) {
              parent.remove();
            } else {
              el.remove();
            }
          }
        });
        
        // Second pass: Remove trailing navigation sections from bottom up
        const allElements = Array.from(content.querySelectorAll('*'));
        let foundNav = false;
        let navStartIndex = allElements.length;
        
        for (let i = allElements.length - 1; i >= 0; i--) {
          const el = allElements[i];
          if (!el.parentElement) continue; // Already removed
          
          const text = el.textContent.trim();
          
          // If we haven't found nav yet and this has substantial content, stop
          if (!foundNav && text.length > 200 && (el.querySelector('p') || el.querySelector('ul') || el.querySelector('pre'))) {
            break;
          }
          
          // Check for navigation patterns
          if (text === 'Next' || text === 'Previous' || 
              text.match(/^(Next|Previous):/i) || 
              text.match(/^(Next|Previous)\s+/i) ||
              navTexts.some(nav => text.includes(nav))) {
            foundNav = true;
            navStartIndex = Math.min(navStartIndex, i);
            el.remove();
            continue;
          }
          
          // If we found nav and this is a short text element (likely a title), remove it
          if (foundNav && text.length > 0 && text.length < 200 && 
              !el.querySelector('p, ul, ol, table, pre, code')) {
            el.remove();
          }
        }
        
        // Third pass: Remove any remaining elements at the very end that look like navigation
        const lastElements = Array.from(content.children).slice(-10); // Last 10 elements
        lastElements.forEach(el => {
          if (!el.parentElement) return;
          const text = el.textContent.trim();
          
          // Remove short elements without substantial content at the end
          if (text.length < 150 && !el.querySelector('p, ul, ol, table, pre, h1, h2, h3, h4, h5, h6, img, object, svg')) {
            el.remove();
          }
          
          // Remove elements that look like navigation links
          if (text.match(/^(Next|Previous):/i) || text.match(/^How to |^What |^Design /i) && text.length < 100) {
            el.remove();
          }
        });
        
        // Fourth pass: Remove any trailing text nodes or elements that are just single words/short phrases at the very end
        // This catches orphaned navigation titles like "Availability", "Reliability", etc.
        const directChildren = Array.from(content.children).slice(-15); // Check last 15 direct children
        for (let i = directChildren.length - 1; i >= 0; i--) {
          const child = directChildren[i];
          if (!child.parentElement) continue;
          
          const text = child.textContent.trim();
          const hasSubstantialContent = child.querySelector('p, ul, ol, table, pre, code, h1, h2, h3, h4, h5, h6, img, object, svg');
          
          // If it's just a short text without any real content structure, likely navigation
          if (!hasSubstantialContent && text.length > 0 && text.length < 80) {
            // Check if it's just words (likely a navigation title)
            const wordCount = text.split(/\s+/).length;
            if (wordCount <= 5) {
              child.remove();
              continue;
            }
          }
          
          // If we hit something with real content, stop
          if (hasSubstantialContent || text.length > 200) {
            break;
          }
        }
        
        // Fifth pass: Look for any standalone link or span elements at the end that are orphaned navigation
        const allDescendants = Array.from(content.querySelectorAll('a, span, div'));
        for (let i = allDescendants.length - 1; i >= 0 && i >= allDescendants.length - 30; i--) {
          const el = allDescendants[i];
          if (!el.parentElement) continue;
          
          const text = el.textContent.trim();
          const parent = el.parentElement;
          
          // Single word or short phrase that's likely a navigation title
          if (text.length > 0 && text.length < 50 && text.split(/\s+/).length <= 3) {
            // Check if it's isolated (not part of a sentence)
            const parentText = parent.textContent.trim();
            if (parentText === text || parentText.length < text.length + 10) {
              // This element is alone or nearly alone in its parent
              parent.remove();
              break; // Stop after removing one to avoid over-removal
            }
          }
        }
        
        return { type: 'html', content: content.innerHTML };
      }
    } catch (error) {
      console.error('Failed to load HTML:', error);
    }
  }
  
  // Fallback: try markdown for other docs
  const mdKey = `/src/content/${docId}/${slug}.md`;
  const mdContent = docFiles[mdKey];
  
  if (mdContent) {
    return { type: 'markdown', content: mdContent };
  }
  
  return null;
}
