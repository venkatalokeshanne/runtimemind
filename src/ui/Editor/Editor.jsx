'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent as TiptapEditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Image as ImageIcon,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Undo,
  Redo,
  Minus,
  Type,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

/**
 * ============================================================================
 * MODERN TIPTAP RICH TEXT EDITOR
 * ============================================================================
 * 
 * Features:
 * - Floating toolbar on text selection (Bubble Menu)
 * - Full formatting support (headings, lists, quotes, code)
 * - Image upload with drag & drop
 * - Link insertion
 * - Keyboard shortcuts
 * - Built-in preview mode
 * - Modern, clean UI matching design system
 * 
 * ============================================================================
 */

// Toolbar Button Component
function ToolbarButton({ onClick, isActive, disabled, children, tooltip }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`
        p-2 rounded-lg transition-all duration-150 
        ${isActive 
          ? 'bg-accent text-white shadow-sm' 
          : 'text-text-primary hover:bg-surface-inset hover:text-text-primary bg-transparent'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-accent/50
      `}
    >
      {children}
    </button>
  );
}

// Divider Component
function ToolbarDivider() {
  return <div className="w-px h-6 bg-border-strong mx-2" />;
}

// Main Toolbar Component
function EditorToolbar({ editor }) {
  if (!editor) return null;

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    
    if (url === null) return;
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  // Extracted toolbar controls so we can reuse the same UI for the fixed clone
  const ToolbarControls = () => (
    <>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        tooltip="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        tooltip="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        tooltip="Underline (Ctrl+U)"
      >
        <UnderlineIcon className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        tooltip="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
        tooltip="Highlight"
      >
        <Highlighter className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        tooltip="Inline Code"
      >
        <Code className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        tooltip="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        tooltip="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        tooltip="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setParagraph().run()}
        isActive={editor.isActive('paragraph')}
        tooltip="Paragraph"
      >
        <Type className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        tooltip="Bullet List"
      >
        <List className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        tooltip="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        tooltip="Quote"
      >
        <Quote className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        tooltip="Code Block"
      >
        <Code2 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        tooltip="Divider"
      >
        <Minus className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        tooltip="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        tooltip="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        tooltip="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        onClick={setLink}
        isActive={editor.isActive('link')}
        tooltip="Add Link"
      >
        <LinkIcon className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={addImage}
        tooltip="Add Image"
      >
        <ImageIcon className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        tooltip="Undo (Ctrl+Z)"
      >
        <Undo className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        tooltip="Redo (Ctrl+Shift+Z)"
      >
        <Redo className="w-4 h-4" />
      </ToolbarButton>
    </>
  );

  // Use IntersectionObserver to toggle a fixed clone when toolbar scrolls past the TopBar.
  const containerRef = useRef(null);
  const [isStuck, setIsStuck] = useState(false);
  const [containerRect, setContainerRect] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const updateRect = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setContainerRect({ left: rect.left + window.scrollX, width: rect.width });
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const topBar = document.querySelector('header.sticky');
    const headerHeight = topBar ? Math.round(topBar.getBoundingClientRect().height) : 64;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // if toolbar top is above header bottom => not intersecting the area under header => should stick
          setIsStuck(!entry.isIntersecting);
        });
      },
      {
        root: null,
        rootMargin: `-${headerHeight + 8}px 0px 0px 0px`,
        threshold: 0,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className={`flex flex-wrap items-center gap-1 p-3 bg-background border border-border-strong rounded-xl mb-4 w-full max-w-[980px] mx-auto shadow-sm transition-transform transition-opacity duration-150 ease-in-out ${isStuck ? 'opacity-0 -translate-y-1 pointer-events-none' : 'opacity-100 translate-y-0'}`}
      >
        <ToolbarControls />
      </div>

      <div
        aria-hidden={!isStuck}
        className="fixed z-50 left-0"
        style={{ top: document.querySelector('header.sticky')?.getBoundingClientRect().bottom || 64, left: containerRect.left, width: containerRect.width }}
      >
        <div className={`flex flex-wrap items-center gap-1 p-3 bg-background border border-border-strong rounded-xl mb-4 shadow-sm transition-transform transition-opacity duration-150 ease-in-out ${isStuck ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}`}>
          <ToolbarControls />
        </div>
      </div>
    </>
  );
}

// Main Editor Component
export function Editor({ data, onChange, showToolbar = true, minHeight = '400px' }) {
  const [isPreview, setIsPreview] = useState(false);
  
  // Convert data to HTML if it's in EditorJS format
  const getInitialContent = () => {
    if (!data) return '';
    if (typeof data === 'string') return data;
    if (data.blocks) {
      // Convert EditorJS format to HTML
      return data.blocks.map(block => {
        switch (block.type) {
          case 'header':
            return `<h${block.data.level || 2}>${block.data.text || ''}</h${block.data.level || 2}>`;
          case 'paragraph':
            return `<p>${block.data.text || ''}</p>`;
          case 'list':
            const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
            const items = block.data.items?.map(item => 
              `<li>${typeof item === 'string' ? item : item.content || ''}</li>`
            ).join('') || '';
            return `<${tag}>${items}</${tag}>`;
          case 'quote':
            return `<blockquote><p>${block.data.text || ''}</p></blockquote>`;
          case 'code':
            return `<pre><code>${block.data.code || ''}</code></pre>`;
          case 'image':
            return block.data.file?.url 
              ? `<img src="${block.data.file.url}" alt="${block.data.caption || ''}" />`
              : '';
          default:
            return '';
        }
      }).join('');
    }
    return '';
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your story...',
        emptyEditorClass: 'is-editor-empty',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: false,
      }),
    ],
    content: getInitialContent(),
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  // Keep editor content in sync when `data` prop changes externally
  useEffect(() => {
    if (!editor) return;
    const html = getInitialContent();
    const current = editor.getHTML();
    if (html !== current) {
      editor.commands.setContent(html, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, editor]);

  // Floating selection toolbar component
  function FloatingSelectionToolbar({ editor }) {
    const [visible, setVisible] = useState(false);
    const [style, setStyle] = useState({ top: 0, left: 0 });

    useEffect(() => {
      if (!editor) return;

      const update = () => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) {
          setVisible(false);
          return;
        }
        const range = sel.getRangeAt(0);
        const text = sel.toString();
        if (!text || text.trim() === '') {
          setVisible(false);
          return;
        }
        const rect = range.getBoundingClientRect();
        if (!rect) {
          setVisible(false);
          return;
        }
        const top = rect.top + window.scrollY - 44;
        const left = rect.left + window.scrollX + rect.width / 2;
        setStyle({ top, left });
        setVisible(true);
      };

      document.addEventListener('selectionchange', update);
      return () => document.removeEventListener('selectionchange', update);
    }, [editor]);

    if (!visible) return null;

    return (
      <div style={{ position: 'fixed', top: style.top, left: style.left, transform: 'translateX(-50%)', zIndex: 60 }}>
        <div className="rounded-lg bg-surface border border-border p-2 flex items-center gap-1 shadow-sm">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} tooltip="Bold">
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} tooltip="Italic">
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} tooltip="Underline">
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} tooltip="Code">
            <Code className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} tooltip="Quote">
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => {
            const previousUrl = editor.getAttributes('link').href;
            const url = window.prompt('Enter URL:', previousUrl);
            if (url === null) return;
            if (url === '') {
              editor.chain().focus().extendMarkRange('link').unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }} tooltip="Link">
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
        </div>
      </div>
    );
  }

  // Handle image drop
  useEffect(() => {
    if (!editor) return;

    const handleDrop = (event) => {
      const files = event.dataTransfer?.files;
      if (files?.length) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          event.preventDefault();
          const url = URL.createObjectURL(file);
          editor.chain().focus().setImage({ src: url }).run();
        }
      }
    };

    const element = editor.view.dom;
    element.addEventListener('drop', handleDrop);
    
    return () => {
      element.removeEventListener('drop', handleDrop);
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="animate-pulse bg-surface rounded-xl p-8" style={{ minHeight }}>
        <div className="h-8 bg-surface-inset rounded w-3/4 mb-4" />
        <div className="h-4 bg-surface-inset rounded w-full mb-2" />
        <div className="h-4 bg-surface-inset rounded w-5/6 mb-2" />
        <div className="h-4 bg-surface-inset rounded w-4/5" />
      </div>
    );
  }

  return (
    <div className="editor-wrapper">
      {/* Preview Toggle */}
      <div className="flex items-center justify-end mb-4">
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary bg-surface hover:bg-surface-elevated border border-border rounded-lg transition-all"
        >
          {isPreview ? (
            <>
              <EyeOff className="w-4 h-4" />
              <span>Edit</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </>
          )}
        </button>
      </div>

      {isPreview ? (
        /* Preview Mode */
        <div 
          className="preview-content bg-white dark:bg-surface-elevated border border-border-strong rounded-xl p-8 shadow-sm"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
        />
      ) : (
        /* Edit Mode */
        <>
          {/* Floating selection toolbar: appears near selected text */}
          {editor && (
            <FloatingSelectionToolbar editor={editor} />
          )}
          {showToolbar && <EditorToolbar editor={editor} />}
          {/* spacer for fixed mobile toolbar so content and buttons aren't covered */}
          {showToolbar && <div className="md:hidden h-16" />}
          
          <div 
            className="editor-content bg-white dark:bg-surface-elevated border border-border-strong rounded-xl p-6 transition-all focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 shadow-sm"
            style={{ minHeight }}
          >
            <TiptapEditorContent editor={editor} />
          </div>
        </>
      )}

      <style jsx global>{`
        /* Editor Container Styles */
        .editor-content .ProseMirror {
          min-height: inherit;
          outline: none;
        }

        /* Placeholder */
        .editor-content .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--brand-text-muted);
          pointer-events: none;
          height: 0;
          font-style: italic;
        }

        /* Typography */
        .editor-content .ProseMirror h1 {
          font-size: 2.25rem;
          font-weight: 700;
          line-height: 1.2;
          margin: 1.5rem 0 1rem 0;
          color: var(--brand-text-primary);
        }

        .editor-content .ProseMirror h2 {
          font-size: 1.75rem;
          font-weight: 600;
          line-height: 1.3;
          margin: 1.5rem 0 0.75rem 0;
          color: var(--brand-text-primary);
        }

        .editor-content .ProseMirror h3 {
          font-size: 1.375rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 1.25rem 0 0.5rem 0;
          color: var(--brand-text-primary);
        }

        .editor-content .ProseMirror p {
          margin: 0.75rem 0;
          line-height: 1.75;
          color: var(--brand-text-primary);
        }

        /* Lists */
        .editor-content .ProseMirror ul,
        .editor-content .ProseMirror ol {
          margin: 1rem 0;
          padding-left: 1.75rem;
        }

        .editor-content .ProseMirror li {
          margin: 0.5rem 0;
          line-height: 1.6;
        }

        .editor-content .ProseMirror ul li {
          list-style-type: disc;
        }

        .editor-content .ProseMirror ol li {
          list-style-type: decimal;
        }

        /* Blockquote */
        .editor-content .ProseMirror blockquote {
          border-left: 4px solid var(--brand-accent);
          padding: 1rem 0 1rem 1.25rem;
          margin: 1.5rem 0;
          background: var(--brand-accent-subtle);
          border-radius: 0 0.5rem 0.5rem 0;
        }

        .editor-content .ProseMirror blockquote p {
          font-style: italic;
          color: var(--brand-text-secondary);
          margin: 0;
        }

        /* Code */
        .editor-content .ProseMirror code {
          background: var(--brand-surface-inset);
          color: var(--brand-accent);
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-family: var(--font-mono);
          font-size: 0.875em;
        }

        .editor-content .ProseMirror pre {
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

        .editor-content .ProseMirror pre code {
          background: transparent;
          color: inherit;
          padding: 0;
          font-size: inherit;
        }

        /* Horizontal Rule */
        .editor-content .ProseMirror hr {
          border: none;
          border-top: 2px solid var(--brand-border);
          margin: 2rem 0;
        }

        /* Images */
        .editor-content .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1.5rem 0;
          display: block;
        }

        .editor-content .ProseMirror img.ProseMirror-selectednode {
          outline: 3px solid var(--brand-accent);
          outline-offset: 2px;
        }

        /* Links */
        .editor-content .ProseMirror a,
        .editor-content .ProseMirror .editor-link {
          color: var(--brand-accent);
          text-decoration: underline;
          text-underline-offset: 2px;
          cursor: pointer;
          transition: color 0.15s ease;
        }

        .editor-content .ProseMirror a:hover,
        .editor-content .ProseMirror .editor-link:hover {
          color: var(--brand-accent-hover);
        }

        /* Highlight */
        .editor-content .ProseMirror mark {
          background: #fef08a;
          color: inherit;
          padding: 0.1em 0.2em;
          border-radius: 0.15rem;
        }

        .dark .editor-content .ProseMirror mark {
          background: #854d0e;
        }

        /* Text Alignment */
        .editor-content .ProseMirror [style*="text-align: center"] {
          text-align: center;
        }

        .editor-content .ProseMirror [style*="text-align: right"] {
          text-align: right;
        }

        /* Preview Styles */
        .preview-content {
          color: var(--brand-text-primary);
          line-height: 1.75;
        }

        .preview-content h1 {
          font-size: 2.25rem;
          font-weight: 700;
          line-height: 1.2;
          margin: 1.5rem 0 1rem 0;
        }

        .preview-content h2 {
          font-size: 1.75rem;
          font-weight: 600;
          line-height: 1.3;
          margin: 1.5rem 0 0.75rem 0;
        }

        .preview-content h3 {
          font-size: 1.375rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 1.25rem 0 0.5rem 0;
        }

        .preview-content p {
          margin: 0.75rem 0;
        }

        .preview-content ul,
        .preview-content ol {
          margin: 1rem 0;
          padding-left: 1.75rem;
        }

        .preview-content li {
          margin: 0.5rem 0;
        }

        .preview-content blockquote {
          border-left: 4px solid var(--brand-accent);
          padding: 1rem 0 1rem 1.25rem;
          margin: 1.5rem 0;
          background: var(--brand-accent-subtle);
          border-radius: 0 0.5rem 0.5rem 0;
          font-style: italic;
          color: var(--brand-text-secondary);
        }

        .preview-content pre {
          background: #1e1e2e;
          color: #cdd6f4;
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
          margin: 1.5rem 0;
          overflow-x: auto;
        }

        .preview-content code {
          background: var(--brand-surface-inset);
          color: var(--brand-accent);
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-family: var(--font-mono);
          font-size: 0.875em;
        }

        .preview-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }

        .preview-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1.5rem 0;
        }

        .preview-content a {
          color: var(--brand-accent);
          text-decoration: underline;
        }

        .preview-content hr {
          border: none;
          border-top: 2px solid var(--brand-border);
          margin: 2rem 0;
        }

        .preview-content mark {
          background: #fef08a;
          padding: 0.1em 0.2em;
          border-radius: 0.15rem;
        }

        .dark .preview-content mark {
          background: #854d0e;
        }
      `}</style>
    </div>
  );
}

export default Editor;