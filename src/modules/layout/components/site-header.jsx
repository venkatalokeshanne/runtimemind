/**
 * ============================================================================
 * MODERN SITE HEADER COMPONENT
 * ============================================================================
 * 
 * Premium navigation header with smooth animations and clean design.
 * Fully responsive with elegant mobile drawer.
 * 
 * ============================================================================
 */

'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  PenSquare, 
  FileText, 
  User, 
  LogOut, 
  ChevronRight, 
  Menu, 
  X, 
  Sparkles, 
  BookOpen, 
  Code2,
  Home,
  Layers,
  BookMarked,
  Settings,
  BarChart3
} from 'lucide-react';
import { ThemeToggle } from '@/lib/theme';
import { useAuth } from '@/lib/auth';
import { Button } from '@/ui/button';
import { cn } from '@/lib/utils';

export function SiteHeader({ siteName = 'Runtimemind' }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Check if user came from series (via query param)
  const fromSeries = searchParams.get('from') === 'series';

  // Helper function to determine if a nav link should be active
  const isLinkActive = (href) => {
    // Exact match for home
    if (href === '/') {
      return pathname === '/';
    }
    
    // Series link: active if on /series/* OR if on an article coming from series
    if (href === '/series') {
      return pathname.startsWith('/series') || 
             (pathname.startsWith('/articles/') && pathname !== '/articles' && fromSeries);
    }
    
    // Articles link: active if on /articles or /articles/[slug], and NOT coming from series
    if (href === '/articles') {
      const isOnArticle = pathname.startsWith('/articles/');
      const isOnArticlesIndex = pathname === '/articles';
      return (isOnArticlesIndex || isOnArticle) && !fromSeries;
    }
    
    // Default: prefix matching for other links
    return pathname.startsWith(href);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scroll when mobile nav is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Conditionally show Reading List (when logged in) or About (when logged out)
  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/articles', label: 'Articles', icon: BookOpen },
    { href: '/series', label: 'Series', icon: Layers },
    ...(user 
      ? [
          { href: '/dashboard/bookmarks', label: 'Reading List', icon: BookMarked },
          { href: '/help', label: 'Docs', icon: FileText }
        ]
      : [
          { href: '/about', label: 'About', icon: Code2 },
          { href: '/help', label: 'Docs', icon: FileText }
        ]
    )
  ];

  return (
    <>
      <header 
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled 
            ? 'bg-surface/95 backdrop-blur-xl shadow-lg border-b border-border' 
            : 'bg-surface/90 backdrop-blur-md border-b border-transparent'
        )} 
        role="banner"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Logo */}
            <Link 
              href="/" 
              className="group flex items-center gap-2.5 font-bold text-xl shrink-0"
            >
              {/* Logo Mark */}
              <div className="relative w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              {/* Logo Text */}
              <span className="text-text-primary group-hover:text-accent transition-colors duration-200 hidden sm:block">
                {siteName}
              </span>
            </Link>

            {/* Desktop Navigation - Center */}
            <nav className="hidden md:flex items-center justify-center flex-1" role="navigation" aria-label="Main navigation">
              <div className="flex items-center bg-hover/50 rounded-full p-1 border border-border/50">
                {navLinks.map(({ href, label, icon: Icon }) => {
                  const isActive = isLinkActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2',
                        isActive 
                          ? 'text-white' 
                          : 'text-text-secondary hover:text-text-primary'
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="navbar-active"
                          className="absolute inset-0 bg-accent rounded-full shadow-sm"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Desktop Right Section */}
            <div className="hidden md:flex items-center gap-2">
              {!loading && (
                user ? (
                  <>
                    <Button variant="ghost" size="sm" asChild className="gap-2 rounded-full">
                      <Link href="/dashboard/new">
                        <PenSquare className="w-4 h-4" />
                        <span className="hidden lg:inline">Write</span>
                      </Link>
                    </Button>
                    <AccountDropdown user={user} signOut={signOut} />
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" asChild className="rounded-full">
                      <Link href="/login">Sign in</Link>
                    </Button>
                    <Button size="sm" asChild className="gap-2 rounded-full">
                      <Link href="/signup">
                        Get Started
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </>
                )
              )}
              <div className="w-px h-6 bg-border mx-1" />
              <ThemeToggle />
            </div>

            {/* Mobile Right Section */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <motion.button
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                  mobileOpen ? 'bg-accent text-white' : 'bg-hover text-text-primary'
                )}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                <AnimatePresence mode="wait">
                  {mobileOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            
            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-[101] w-[85vw] max-w-sm bg-surface border-l border-border shadow-2xl md:hidden flex flex-col"
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-text-primary">Menu</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 rounded-xl bg-hover flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-text-primary" />
                </motion.button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto p-4">
                <nav className="space-y-1">
                  {navLinks.map(({ href, label, icon: Icon }, index) => {
                    const isActive = isLinkActive(href);
                    return (
                      <motion.div
                        key={href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200',
                            isActive
                              ? 'bg-accent text-white shadow-sm'
                              : 'text-text-primary hover:bg-hover'
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          {label}
                          {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                {/* Divider */}
                <div className="my-6 h-px bg-border" />

                {/* Auth Section */}
                {!loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {user ? (
                      <div className="space-y-3">
                        {/* User Card */}
                        <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                          <div className="flex items-center gap-3">
                            {user?.avatar_url ? (
                              <img 
                                src={user.avatar_url} 
                                alt={user.name || 'Account'} 
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-surface shadow-sm" 
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-lg font-bold text-white shadow-sm">
                                {(user?.name || user?.email?.split('@')[0] || 'U').slice(0,1).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-text-primary truncate">
                                {user?.name || user?.email?.split('@')[0] || 'User'}
                              </div>
                              <div className="text-sm text-text-secondary truncate">
                                {user?.email || ''}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            href="/dashboard/new"
                            onClick={() => setMobileOpen(false)}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-accent text-white"
                          >
                            <PenSquare className="w-5 h-5" />
                            <span className="text-sm font-medium">Write</span>
                          </Link>
                          <Link
                            href="/dashboard"
                            onClick={() => setMobileOpen(false)}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-hover text-text-primary"
                          >
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="text-sm font-medium">Dashboard</span>
                          </Link>
                        </div>

                        {/* More Links */}
                        <div className="space-y-1">
                          <Link
                            href="/dashboard/posts"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-primary hover:bg-hover transition-colors"
                          >
                            <FileText className="w-5 h-5 text-text-secondary" />
                            <span>My Posts</span>
                          </Link>
                          <Link
                            href="/dashboard/analytics"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-primary hover:bg-hover transition-colors"
                          >
                            <BarChart3 className="w-5 h-5 text-text-secondary" />
                            <span>Analytics</span>
                          </Link>
                          <Link
                            href="/dashboard/settings"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-primary hover:bg-hover transition-colors"
                          >
                            <Settings className="w-5 h-5 text-text-secondary" />
                            <span>Settings</span>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button variant="outline" size="lg" asChild className="w-full rounded-xl h-12">
                          <Link href="/login" onClick={() => setMobileOpen(false)}>
                            Sign in
                          </Link>
                        </Button>
                        <Button size="lg" asChild className="w-full rounded-xl h-12 gap-2">
                          <Link href="/signup" onClick={() => setMobileOpen(false)}>
                            Get Started
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Mobile Footer */}
              {user && (
                <div className="p-4 border-t border-border">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      try {
                        await signOut();
                        window.location.href = '/';
                      } catch (e) {
                        console.error('Sign out failed', e);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-error/10 text-error font-medium hover:bg-error/15 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign out
                  </motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ============================================================================
 * ACCOUNT DROPDOWN (Desktop Only)
 * ============================================================================ */
function AccountDropdown({ user, signOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/posts', label: 'My Posts', icon: FileText },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/new', label: 'Write Post', icon: PenSquare },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        aria-label="Account"
        aria-expanded={open}
        className={cn(
          'relative p-0.5 rounded-full transition-all duration-200',
          open ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface' : 'hover:ring-2 hover:ring-border'
        )}
      >
        {user?.avatar_url ? (
          <img 
            src={user.avatar_url} 
            alt={user.name || 'Account'} 
            className="w-9 h-9 rounded-full object-cover" 
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-white">
            {(user?.name || 'U').slice(0,1)}
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 bg-surface border border-border rounded-xl shadow-xl overflow-hidden"
          >
            {/* User Header */}
            <div className="p-4 bg-accent/5 border-b border-border">
              <div className="flex items-center gap-3">
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.name || 'Account'} 
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-surface" 
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center text-base font-bold text-white">
                    {(user?.name || user?.email?.split('@')[0] || 'U').slice(0,1).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-text-primary truncate">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-sm text-text-secondary truncate">
                    {user?.email || ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map(({ href, label, icon: Icon }) => (
                <Link 
                  key={href}
                  href={href} 
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-hover transition-colors group"
                >
                  <Icon className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
                  <span className="text-sm text-text-primary">{label}</span>
                </Link>
              ))}
            </div>

            {/* Sign Out */}
            <div className="p-2 border-t border-border">
              <button
                onClick={async () => {
                  setOpen(false);
                  try {
                    await signOut();
                    window.location.href = '/';
                  } catch (e) {
                    console.error('Sign out failed', e);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-error text-sm font-medium hover:bg-error/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
