import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '@/features/theme/themeSlice';
import { openSearch } from '@/features/search/searchSlice';
import { Button } from '@/components/ui/Button';
import { toggleSidebar } from '@/features/docs/docsSlice';

export function Header() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-light dark:border-border-dark/50 bg-surface-0 dark:bg-surface-900">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden"
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Button>

          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-light dark:border-border-dark/80 bg-surface-0 dark:bg-surface-900 text-primary-700 dark:text-primary-300 font-semibold">
              RM
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">RuntimeMind</span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Docs & Knowledge</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(openSearch())}
            className="hidden sm:inline-flex gap-2 text-neutral-600 dark:text-neutral-300"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M7 12A5 5 0 1 0 7 2a5 5 0 0 0 0 10zM14 14l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-sm">Search</span>
            <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-border-light dark:border-border-dark/60 bg-surface-50 dark:bg-surface-900 px-1.5 text-[11px] font-medium text-neutral-500 dark:text-neutral-300">
              ⌘K
            </kbd>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleTheme())}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3V2M10 18v-1M16.95 10h1M2 10h1M15.5 4.5l.7-.7M3.8 16.2l.7-.7M15.5 15.5l.7.7M3.8 3.8l.7.7M13 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17 11.5A7 7 0 1 1 8.5 3a6 6 0 0 0 8.5 8.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
