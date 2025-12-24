import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { MarkdownRenderer } from '@/features/docs/MarkdownRenderer';
import HtmlRenderer from '@/features/docs/HtmlRenderer';
import { docIndex } from '@/features/docs/docIndex';
import { loadDocContent } from '@/features/docs/utils/contentLoader';

const docs = {
  introduction: `# Introduction to RuntimeMind

Welcome to **RuntimeMind**, a modern documentation platform built with React, Redux Toolkit, and Tailwind CSS.

## What is RuntimeMind?

RuntimeMind is designed to be a clean, professional documentation platform that prioritizes:

- **Readability**: Long-form content optimized for reading
- **Developer Experience**: Built with modern React patterns
- **Scalability**: Architecture ready for growth
- **Accessibility**: WCAG compliant, keyboard navigable

## Key Features

### Clean Design System
Our design follows principles from leading documentation platforms like GitBook and Vercel Docs, with:
- Consistent spacing and typography
- Professional color palette
- Smooth micro-interactions
- Dark mode support

### Modern Tech Stack
Built with industry-standard tools:
- React 19 with hooks
- Redux Toolkit for state management
- React Query for server state
- Tailwind CSS for styling
- React Markdown with syntax highlighting

### Feature-Based Architecture
The codebase is organized by features for scalability:
\`\`\`
src/
  features/        # Feature modules (docs, theme, search)
  components/      # Reusable UI components
  store/           # Redux store configuration
  lib/             # Utilities and helpers
\`\`\`

## Getting Started

Check out the [Quick Start](/docs/quick-start) guide to begin exploring RuntimeMind.`,

  'quick-start': `# Quick Start Guide

Get up and running with RuntimeMind in minutes.

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- A code editor (VS Code recommended)

## Installation Steps

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/yourusername/runtimemind.git
cd runtimemind
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Start Development Server
\`\`\`bash
npm run dev
\`\`\`

Your application will be running at \`http://localhost:5173\`

## Project Structure

Here's what you'll find in the codebase:

| Directory | Purpose |
|-----------|---------|
| \`src/features/\` | Feature modules (docs, theme, search) |
| \`src/components/\` | Reusable UI components |
| \`src/store/\` | Redux store and slices |
| \`src/pages/\` | Route page components |
| \`src/lib/\` | Utility functions |

## Next Steps

- Explore the [Architecture](/docs/architecture) to understand the system design
- Learn about [Features](/docs/features) available in RuntimeMind
- Check out [Components](/docs/components) to see UI building blocks`,

  installation: `# Installation Guide

Detailed instructions for setting up RuntimeMind.

## System Requirements

### Required
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: For version control

### Recommended
- **VS Code**: With ESLint and Prettier extensions
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## Step-by-Step Installation

### 1. Install Node.js

Download and install Node.js from [nodejs.org](https://nodejs.org)

Verify installation:
\`\`\`bash
node --version
npm --version
\`\`\`

### 2. Create New Project

Using Vite template:
\`\`\`bash
npm create vite@latest my-docs -- --template react
cd my-docs
\`\`\`

### 3. Install RuntimeMind Dependencies

\`\`\`bash
npm install @reduxjs/toolkit react-redux @tanstack/react-query
npm install react-router-dom react-markdown remark-gfm
npm install tailwindcss postcss autoprefixer
npm install clsx tailwind-merge cmdk framer-motion
npm install prism-react-renderer rehype-raw rehype-slug
\`\`\`

### 4. Configure Tailwind CSS

Initialize Tailwind:
\`\`\`bash
npx tailwindcss init -p
\`\`\`

Update \`tailwind.config.js\`:
\`\`\`javascript
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {},
  },
}
\`\`\`

### 5. Set Up Redux Store

Create \`src/store/store.js\`:
\`\`\`javascript
import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '@/features/theme/themeSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
});
\`\`\`

## Verification

Run the development server:
\`\`\`bash
npm run dev
\`\`\`

You should see the application running at \`http://localhost:5173\`

## Troubleshooting

### Port Already in Use
If port 5173 is busy:
\`\`\`bash
npm run dev -- --port 3000
\`\`\`

### Module Not Found
Clear node_modules and reinstall:
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\``,

  architecture: `# Architecture Overview

Understanding RuntimeMind's design principles and structure.

## Design Philosophy

RuntimeMind follows clean architecture principles:

1. **Separation of Concerns**: Features are isolated and independent
2. **Scalability**: Easy to add new features without refactoring
3. **Maintainability**: Clear structure makes code easy to understand
4. **Testability**: Components and features can be tested in isolation

## Folder Structure

\`\`\`
src/
├── features/              # Feature modules
│   ├── docs/             # Documentation feature
│   │   ├── docsSlice.js  # Redux slice
│   │   └── MarkdownRenderer.jsx
│   ├── theme/            # Theme management
│   │   └── themeSlice.js
│   └── search/           # Search functionality
│       ├── searchSlice.js
│       └── SearchCommand.jsx
├── components/           # Shared components
│   ├── ui/              # Base UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   └── Container.jsx
│   └── layout/          # Layout components
│       ├── Header.jsx
│       └── Sidebar.jsx
├── store/               # Redux configuration
│   └── store.js
├── pages/               # Route pages
│   ├── HomePage.jsx
│   └── DocPage.jsx
├── lib/                 # Utilities
│   └── utils.js
└── content/             # Markdown content
    └── docs/
\`\`\`

## State Management

### Redux Toolkit
Global UI state managed with Redux:
- **Theme**: Dark/light mode state
- **Docs**: Current document, sidebar state
- **Search**: Search open/close, query state

### React Query
Server state and caching (ready for API integration):
- Document fetching
- Search results
- Future: User authentication

## Component Architecture

### UI Components
Atomic design pattern:
- **Atoms**: Button, Input (basic elements)
- **Molecules**: Header, SearchBar (combinations)
- **Organisms**: Sidebar, MarkdownRenderer (complex)

### Feature Components
Each feature is self-contained:
- State management (Redux slice)
- UI components
- Business logic
- Types/constants

## Routing Strategy

Using React Router v6:
- \`/\` - Home page
- \`/docs/:slug\` - Documentation pages
- Future: \`/blog/:slug\`, \`/about\`, etc.

## Styling Approach

**Tailwind CSS** with custom design tokens:
- Utility-first for rapid development
- Custom theme configuration
- Dark mode via class strategy
- Consistent spacing scale`,

  features: `# Features

Explore what RuntimeMind offers.

## Core Features

### 📝 Markdown Support
Full-featured markdown rendering with:
- GitHub Flavored Markdown (GFM)
- Tables, task lists, strikethrough
- Automatic heading anchors
- Raw HTML support via rehype-raw

### 🎨 Syntax Highlighting
Beautiful code blocks powered by Prism:
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

\`\`\`python
def calculate_sum(numbers):
    return sum(numbers)
\`\`\`

### 🔍 Instant Search
Fast command palette search:
- Press \`⌘K\` (Mac) or \`Ctrl+K\` (Windows)
- Keyboard-navigable results
- Grouped by category
- Fuzzy matching

### 🌙 Dark Mode
System-aware theme with manual toggle:
- Respects OS preferences
- Smooth transitions
- Persistent selection
- Optimized contrast for readability

### 📱 Responsive Design
Mobile-first approach:
- Collapsible sidebar on mobile
- Touch-optimized navigation
- Readable on all screen sizes

## Developer Features

### Hot Module Replacement
Instant feedback during development with Vite

### ESLint Configuration
Code quality enforcement out of the box

### Path Aliases
Clean imports using \`@/\` prefix:
\`\`\`javascript
import { Button } from '@/components/ui/Button';
\`\`\`

### TypeScript Ready
While we use JavaScript, the structure supports TypeScript migration

## Upcoming Features

- [ ] Full-text search
- [ ] Table of contents generation
- [ ] Page navigation (prev/next)
- [ ] Edit on GitHub links
- [ ] Version selector
- [ ] Multi-language support`,

  components: `# Components

UI building blocks of RuntimeMind.

## Design System Components

### Button
Versatile button with multiple variants:

**Variants:**
- \`default\` - Primary action button
- \`ghost\` - Subtle, transparent button
- \`outline\` - Bordered button

**Sizes:**
- \`sm\` - Small button
- \`default\` - Standard size
- \`lg\` - Large button
- \`icon\` - Square icon button

**Usage:**
\`\`\`jsx
import { Button } from '@/components/ui/Button';

<Button variant="default" size="lg">
  Click Me
</Button>
\`\`\`

### Container
Responsive container with max-width constraints:

\`\`\`jsx
import { Container } from '@/components/ui/Container';

<Container size="prose">
  <h1>Content Here</h1>
</Container>
\`\`\`

### Input
Form input with consistent styling:

\`\`\`jsx
import { Input } from '@/components/ui/Input';

<Input 
  type="text" 
  placeholder="Search..." 
/>
\`\`\`

## Layout Components

### Header
Top navigation bar with:
- Logo and branding
- Search trigger
- Theme toggle
- Mobile menu button

### Sidebar
Navigation sidebar featuring:
- Hierarchical navigation
- Active page highlighting
- Mobile responsive (slides in/out)
- Smooth transitions

## Feature Components

### MarkdownRenderer
Renders markdown with custom styling:
- Syntax-highlighted code blocks
- Styled headings and text
- Custom table styling
- Link formatting

### SearchCommand
Command palette for quick navigation:
- Keyboard shortcuts (\`⌘K\`)
- Categorized results
- Fuzzy search
- Smooth modal animations

## Utility Functions

### cn()
Combines classNames with proper merging:

\`\`\`javascript
import { cn } from '@/lib/utils';

const classes = cn(
  'base-class',
  condition && 'conditional-class',
  'text-gray-500'
);
\`\`\``,

  customization: `# Customization Guide

Make RuntimeMind your own.

## Theme Customization

### Color Palette
Edit \`tailwind.config.js\` to change colors:

\`\`\`javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#your-color',
        // ... other shades
        900: '#your-color',
      },
    },
  },
}
\`\`\`

### Typography
Customize fonts:

\`\`\`javascript
theme: {
  extend: {
    fontFamily: {
      sans: ['Your Font', 'system-ui'],
      mono: ['Your Mono Font', 'monospace'],
    },
  },
}
\`\`\`

## Layout Customization

### Sidebar Navigation
Edit \`src/components/layout/Sidebar.jsx\`:

\`\`\`javascript
const navigation = [
  {
    title: 'Your Section',
    items: [
      { title: 'Your Page', href: '/docs/your-page' },
    ],
  },
];
\`\`\`

### Header Branding
Modify \`src/components/layout/Header.jsx\`:
- Change logo
- Update site name
- Add custom navigation items

## Content Customization

### Adding New Pages
1. Create markdown file in \`src/content/docs/\`
2. Add route in documentation data
3. Update navigation in Sidebar

### Styling Markdown
Customize in \`src/features/docs/MarkdownRenderer.jsx\`:
- Heading styles
- Code block themes
- Link colors
- Table formatting

## Advanced Customization

### Adding New Features
1. Create feature folder in \`src/features/\`
2. Add Redux slice if needed
3. Build components
4. Integrate in main app

### Custom Components
Extend the UI library:
\`\`\`jsx
// src/components/ui/YourComponent.jsx
export function YourComponent({ ...props }) {
  return <div>...</div>;
}
\`\`\``,

  'best-practices': `# Best Practices

Guidelines for maintaining high-quality code.

## Code Organization

### Feature-Based Structure
Keep related code together:
- Component files with their logic
- Redux slices within features
- Tests next to source files

### Component Guidelines
- **Single Responsibility**: One component, one purpose
- **Composition over Inheritance**: Build complex UIs from simple parts
- **Props over State**: Prefer props when possible

## State Management

### When to Use Redux
Use Redux for:
- Global UI state (theme, sidebar open/close)
- State shared across many components
- Complex state logic

### When to Use Local State
Use \`useState\` for:
- Component-specific state
- Form inputs
- UI toggles

### React Query for Server State
- API data fetching
- Caching
- Background updates

## Styling Best Practices

### Tailwind Patterns
\`\`\`jsx
// Good: Organized, readable
<div className={cn(
  // Layout
  'flex items-center gap-4',
  // Appearance
  'bg-white dark:bg-gray-950',
  // Typography
  'text-sm font-medium',
  // Conditional
  isActive && 'text-primary-600'
)}>
\`\`\`

### Avoid Magic Numbers
\`\`\`javascript
// Bad
<div className="mt-37 pl-13">

// Good
<div className="mt-8 pl-4">
\`\`\`

## Performance

### Code Splitting
Split routes for faster initial load:
\`\`\`javascript
const DocPage = lazy(() => import('./pages/DocPage'));
\`\`\`

### Memoization
Use \`useMemo\` and \`useCallback\` wisely:
- For expensive calculations
- To prevent unnecessary re-renders

### Image Optimization
- Use appropriate formats (WebP)
- Lazy load images
- Provide width/height attributes

## Accessibility

### Semantic HTML
Always use proper HTML elements:
\`\`\`jsx
// Good
<nav>
  <button>Menu</button>
</nav>

// Bad
<div>
  <div onClick={...}>Menu</div>
</div>
\`\`\`

### ARIA Labels
Add labels for screen readers:
\`\`\`jsx
<button aria-label="Toggle theme">
  <MoonIcon />
</button>
\`\`\`

### Keyboard Navigation
Ensure all interactive elements are keyboard accessible

## Testing

### Component Tests
Test behavior, not implementation:
\`\`\`javascript
// Good: Test user interaction
expect(screen.getByText('Click me')).toBeInTheDocument();

// Bad: Test internal state
expect(component.state.value).toBe(5);
\`\`\`

## Git Workflow

### Commit Messages
Use conventional commits:
- \`feat: add search functionality\`
- \`fix: resolve dark mode toggle\`
- \`docs: update installation guide\`

### Branch Strategy
- \`main\` - Production-ready code
- \`develop\` - Integration branch
- \`feature/\` - New features
- \`fix/\` - Bug fixes`,

  deployment: `# Deployment Guide

Deploy RuntimeMind to production.

## Build for Production

### Create Production Build
\`\`\`bash
npm run build
\`\`\`

This creates optimized files in \`dist/\` directory:
- Minified JavaScript
- Optimized CSS
- Compressed assets

### Preview Production Build
\`\`\`bash
npm run preview
\`\`\`

## Deployment Options

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Deploy automatically

**Configuration:**
\`\`\`json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
\`\`\`

### Netlify
1. Connect GitHub repository
2. Configure build settings:
   - Build command: \`npm run build\`
   - Publish directory: \`dist\`

**netlify.toml:**
\`\`\`toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
\`\`\`

### GitHub Pages
\`\`\`bash
npm install -D gh-pages
\`\`\`

Add to \`package.json\`:
\`\`\`json
{
  "homepage": "https://yourusername.github.io/runtimemind",
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}
\`\`\`

Deploy:
\`\`\`bash
npm run build
npm run deploy
\`\`\`

### Docker
Create \`Dockerfile\`:
\`\`\`dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

Build and run:
\`\`\`bash
docker build -t runtimemind .
docker run -p 80:80 runtimemind
\`\`\`

## Environment Variables

Create \`.env.production\`:
\`\`\`
VITE_API_URL=https://api.yoursite.com
VITE_SITE_URL=https://yoursite.com
\`\`\`

Access in code:
\`\`\`javascript
const apiUrl = import.meta.env.VITE_API_URL;
\`\`\`

## Performance Optimization

### Enable Compression
Most platforms enable gzip/brotli automatically.

### CDN Configuration
Serve static assets from CDN:
- Images
- Fonts
- JavaScript/CSS bundles

### Caching Strategy
Configure headers:
\`\`\`
Cache-Control: public, max-age=31536000, immutable
\`\`\`

## Monitoring

### Error Tracking
Integrate Sentry:
\`\`\`bash
npm install @sentry/react
\`\`\`

### Analytics
Add Google Analytics or Plausible for insights

## Post-Deployment

### Verify Checklist
- [ ] All pages load correctly
- [ ] Dark mode works
- [ ] Search functions properly
- [ ] Mobile responsive
- [ ] Performance metrics acceptable
- [ ] SEO meta tags present

### Domain Configuration
1. Add custom domain in hosting platform
2. Configure DNS records
3. Enable HTTPS
4. Set up redirects (www → non-www)`,
};

export function DocPage() {
  const { docId, slug } = useParams();
  const [content, setContent] = useState('');
  const entries = Object.entries(docIndex);
  const fallbackId = entries[0]?.[0];
  const activeDocId = docIndex[docId] ? docId : fallbackId;
  const activeDoc = docIndex[activeDocId];
  const targetSlug = slug || activeDoc?.defaultSlug || 'introduction';

  useEffect(() => {
    async function loadContent() {
      const fileContent = await loadDocContent(activeDocId, targetSlug);
      if (fileContent) {
        setContent(fileContent);
      } else {
        const fallbackContent = await loadDocContent(activeDocId, activeDoc?.defaultSlug);
        if (fallbackContent) {
          setContent(fallbackContent);
        } else {
          setContent({ type: 'markdown', content: docs[targetSlug] || docs['introduction'] });
        }
      }
      window.scrollTo(0, 0);
    }
    
    loadContent();
  }, [activeDoc, activeDocId, targetSlug]);

  const meta = (() => {
    const section = activeDoc?.sections?.flatMap((s) => s.pages).find((p) => p.slug === targetSlug);
    return {
      title: section?.title || activeDoc?.title || 'Documentation',
      summary: activeDoc?.description || 'Reference and guides.',
      docTitle: activeDoc?.title || 'Docs',
    };
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-0 via-base-0 to-base-50 dark:from-surface-950 dark:via-surface-900 dark:to-surface-900">
      <Container size="prose" className="py-4 sm:py-8">
        {/* Hero header with gradient */}
        <div className="relative mb-4 sm:mb-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-50 via-surface-0 to-accent-100 dark:from-surface-900 dark:via-surface-900 dark:to-primary-900/20 p-4 sm:p-6 shadow-soft border border-primary-100/50 dark:border-primary-900/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-200/30 to-accent-200/30 dark:from-primary-800/20 dark:to-accent-800/20 rounded-full blur-3xl" />
          <div className="relative space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                {meta.docTitle}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">·</span>
              <span className="text-xs text-neutral-600 dark:text-neutral-300 font-medium hidden sm:inline">Updated December 2025</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700 dark:from-neutral-50 dark:via-neutral-100 dark:to-neutral-200 bg-clip-text text-transparent leading-tight">
              {meta.title}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-neutral-700 dark:text-neutral-300 max-w-2xl">{meta.summary}</p>
          </div>
        </div>

        {/* Content card with glass effect */}
        <article className="relative min-h-[60vh] rounded-xl sm:rounded-2xl bg-surface-0/80 dark:bg-surface-900/80 backdrop-blur-sm border border-border-light/50 dark:border-border-dark/30 shadow-card p-2 sm:p-6 animate-in">
          {content?.type === 'html' ? (
            <HtmlRenderer html={content.content} />
          ) : (
            <MarkdownRenderer content={content?.content || content} />
          )}
        </article>
        
        {/* Modern footer with gradient accent */}
        <footer className="mt-4 sm:mt-8 relative rounded-lg sm:rounded-xl bg-gradient-to-r from-surface-50 to-primary-50/30 dark:from-surface-900 dark:to-primary-900/10 border border-border-light dark:border-border-dark/40 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200">
            <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Have feedback? Help us improve.
          </div>
          <div className="flex items-center gap-2">
            <a href="#" className="inline-flex items-center gap-1.5 rounded-lg bg-surface-0 dark:bg-surface-950 border border-border-light dark:border-border-dark px-3 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-200 dark:hover:border-primary-800 transition-all shadow-sm">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit page
            </a>
            <a href="#" className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 border border-primary-600 dark:border-primary-700 px-3 py-1.5 text-sm font-semibold text-white transition-all shadow-sm hover:shadow">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Report issue
            </a>
          </div>
        </footer>
      </Container>
    </div>
  );
}
