import { useEffect, useRef } from 'react';
import './HtmlRenderer.css';

export default function HtmlRenderer({ html }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && html) {
      // Set the HTML content
      containerRef.current.innerHTML = html;

      // Handle internal anchor links
      const handleAnchorClick = (e) => {
        const target = e.target.closest('a');
        if (target && target.hash) {
          e.preventDefault();
          const element = document.querySelector(target.hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      };

      containerRef.current.addEventListener('click', handleAnchorClick);

      return () => {
        if (containerRef.current) {
          containerRef.current.removeEventListener('click', handleAnchorClick);
        }
      };
    }
  }, [html]);

  return (
    <div 
      ref={containerRef}
      className="html-content"
    />
  );
}
