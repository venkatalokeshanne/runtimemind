'use client';

import React from 'react';

/**
 * ============================================================================
 * EDITOR CONTENT RENDERER
 * ============================================================================
 * 
 * Renders HTML content from TipTap editor with beautiful styling.
 * Supports both HTML strings and legacy EditorJS block format.
 * 
 * ============================================================================
 */

export function EditorContent({ data, className = '' }) {
  // Handle empty content
  if (!data) {
    return (
      <div className={`rendered-content text-text-muted ${className}`}>
        <p>No content to display.</p>
      </div>
    );
  }

  // If data is already HTML string (from TipTap)
  if (typeof data === 'string') {
    return (
      <>
        <div 
          className={`rendered-content ${className}`}
          dangerouslySetInnerHTML={{ __html: data }}
        />
        <style jsx global>{renderedContentStyles}</style>
      </>
    );
  }

  // Handle legacy EditorJS block format
  if (data.blocks && Array.isArray(data.blocks)) {
    const html = data.blocks.map(renderBlock).join('');
    return (
      <>
        <div 
          className={`rendered-content ${className}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <style jsx global>{renderedContentStyles}</style>
      </>
    );
  }

  return (
    <div className={`rendered-content text-text-muted ${className}`}>
      <p>Unable to render content.</p>
    </div>
  );
}

// Styles for rendered content
const renderedContentStyles = `
  .rendered-content {
    color: var(--brand-text-primary);
    line-height: 1.75;
  }
  
  .rendered-content h1 {
    font-size: 2.25rem;
    font-weight: 700;
    line-height: 1.2;
    margin: 1.5rem 0 1rem 0;
    color: var(--brand-text-primary);
  }
  
  .rendered-content h2 {
    font-size: 1.75rem;
    font-weight: 600;
    line-height: 1.3;
    margin: 1.5rem 0 0.75rem 0;
    color: var(--brand-text-primary);
  }
  
  .rendered-content h3 {
    font-size: 1.375rem;
    font-weight: 600;
    line-height: 1.4;
    margin: 1.25rem 0 0.5rem 0;
    color: var(--brand-text-primary);
  }
  
  .rendered-content h4 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 1rem 0 0.5rem 0;
    color: var(--brand-text-primary);
  }
  
  .rendered-content p {
    margin: 0.75rem 0;
    line-height: 1.75;
  }
  
  .rendered-content ul,
  .rendered-content ol {
    margin: 1rem 0;
    padding-left: 1.75rem;
  }
  
  .rendered-content li {
    margin: 0.5rem 0;
    line-height: 1.6;
  }
  
  .rendered-content ul li {
    list-style-type: disc;
  }
  
  .rendered-content ol li {
    list-style-type: decimal;
  }
  
  .rendered-content ul ul,
  .rendered-content ol ol,
  .rendered-content ul ol,
  .rendered-content ol ul {
    margin: 0.25rem 0;
  }
  
  .rendered-content blockquote {
    border-left: 4px solid var(--brand-accent);
    padding: 1rem 0 1rem 1.25rem;
    margin: 1.5rem 0;
    background: var(--brand-accent-subtle);
    border-radius: 0 0.5rem 0.5rem 0;
  }
  
  .rendered-content blockquote p {
    font-style: italic;
    color: var(--brand-text-secondary);
    margin: 0;
  }
  
  .rendered-content blockquote cite {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: var(--brand-text-muted);
    font-style: normal;
  }
  
  .rendered-content code {
    background: var(--brand-surface-inset);
    color: var(--brand-accent);
    padding: 0.2em 0.4em;
    border-radius: 0.25rem;
    font-family: var(--font-mono);
    font-size: 0.875em;
  }
  
  .rendered-content pre {
    background: #1e1e2e;
    color: #cdd6f4;
    border-radius: 0.75rem;
    padding: 1rem 1.25rem;
    margin: 1.5rem 0;
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: 0.875rem;
    line-height: 1.6;
  }
  
  .rendered-content pre code {
    background: transparent;
    color: inherit;
    padding: 0;
    font-size: inherit;
  }
  
  .rendered-content hr {
    border: none;
    border-top: 2px solid var(--brand-border);
    margin: 2rem 0;
  }
  
  .rendered-content figure {
    margin: 1.5rem 0;
  }
  
  .rendered-content img {
    max-width: 100%;
    height: auto;
    border-radius: 0.75rem;
    display: block;
  }
  
  .rendered-content figcaption {
    font-size: 0.875rem;
    color: var(--brand-text-muted);
    text-align: center;
    margin-top: 0.5rem;
  }
  
  .rendered-content a {
    color: var(--brand-accent);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  
  .rendered-content a:hover {
    color: var(--brand-accent-hover);
  }
  
  .rendered-content mark {
    background: #fef08a;
    color: inherit;
    padding: 0.1em 0.2em;
    border-radius: 0.15rem;
  }
  
  .dark .rendered-content mark {
    background: #854d0e;
  }
  
  .rendered-content strong {
    font-weight: 600;
  }
  
  .rendered-content em {
    font-style: italic;
  }
  
  .rendered-content u {
    text-decoration: underline;
  }
  
  .rendered-content s {
    text-decoration: line-through;
  }
`;

export { EditorContent };

function renderBlock(block) {
  switch (block.type) {
    case 'paragraph':
      return `<p>${block.data.text || ''}</p>`;

    case 'header':
      return renderHeader(block.data);

    case 'list':
      return renderList(block.data);

    case 'quote':
      return renderQuote(block.data);

    case 'code':
      return renderCode(block.data);

    case 'image':
      return renderImage(block.data);

    default:
      return '';
  }
}

function renderHeader({ text, level }) {
  const safeLevel = Math.min(Math.max(level || 2, 1), 4);
  return `<h${safeLevel}>${text || ''}</h${safeLevel}>`;
}

function renderList({ style, items }) {
  const tag = style === 'ordered' ? 'ol' : 'ul';
  return `<${tag}>${items.map(renderListItem).join('')}</${tag}>`;
}

function renderListItem(item) {
  if (typeof item === 'string') {
    return `<li>${item}</li>`;
  }

  if (typeof item === 'object') {
    const content = item.content || '';
    const children = Array.isArray(item.items) && item.items.length
      ? `<ul>${item.items.map(renderListItem).join('')}</ul>`
      : '';
    return `<li>${content}${children}</li>`;
  }

  return '';
}

function renderQuote({ text, caption }) {
  return `
    <blockquote>
      <p>${text || ''}</p>
      ${caption ? `<cite>${caption}</cite>` : ''}
    </blockquote>
  `;
}

function renderCode({ code }) {
  return `<pre><code>${escapeHtml(code || '')}</code></pre>`;
}

function renderImage({ file, caption }) {
  if (!file?.url) return '';
  return `
    <figure>
      <img src="${file.url}" alt="${caption || ''}" />
      ${caption ? `<figcaption>${caption}</figcaption>` : ''}
    </figure>
  `;
}

function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default EditorContent;