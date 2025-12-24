import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { cn } from '@/lib/utils';
import { docIndex } from '@/features/docs/docIndex';
import { setSidebarOpen } from '@/features/docs/docsSlice';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { docId: routeDocId } = useParams();
  const isOpen = useSelector((state) => state.docs.sidebarOpen);

  const docEntries = Object.entries(docIndex);
  const fallbackId = docEntries[0]?.[0];
  const activeDocId = docIndex[routeDocId] ? routeDocId : fallbackId;
  const activeDoc = docIndex[activeDocId];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-neutral-900/60 lg:hidden transition-opacity duration-200 backdrop-blur-sm',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => dispatch(setSidebarOpen(false))}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-72 shrink-0',
          'border-r border-border-light dark:border-border-dark/30',
          'bg-gradient-to-b from-surface-0 to-surface-50 dark:from-surface-900 dark:to-surface-950',
          'shadow-card dark:shadow-none overflow-y-auto transition-transform duration-300 ease-out lg:transition-none',
          'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <nav className="p-5 space-y-6 pb-8">
          {/* Document Selector */}
          <div className="space-y-3 pb-4 border-b border-border-light/50 dark:border-border-dark/20">
            <label htmlFor="doc-selector" className="block px-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
              Documentation
            </label>
            <select
              id="doc-selector"
              value={activeDocId}
              onChange={(e) => {
                const newDocId = e.target.value;
                const newDoc = docIndex[newDocId];
                navigate(`/docs/${newDocId}/${newDoc.defaultSlug}`);
              }}
              className={cn(
                'w-full rounded-xl border-2 border-border-light dark:border-border-dark/40',
                'bg-white dark:bg-surface-950 px-4 py-2.5 text-sm font-semibold',
                'text-neutral-900 dark:text-neutral-100',
                'shadow-soft dark:shadow-none',
                'hover:border-primary-300 dark:hover:border-primary-700/50',
                'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
                'transition-all duration-200 cursor-pointer'
              )}
            >
              {docEntries.map(([id, doc]) => (
                <option key={id} value={id}>
                  {doc.title}
                </option>
              ))}
            </select>
          </div>

          {/* Sections */}
          {activeDoc?.sections?.map((section, idx) => (
            <div key={section.title} className="space-y-2">
              <div className="flex items-center gap-2 px-2.5">
                <div className="w-1 h-3 rounded-full bg-gradient-to-b from-primary-400 to-primary-600 dark:from-primary-500 dark:to-primary-700" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-600 dark:text-neutral-400">
                  {section.title}
                </h3>
              </div>
              <ul className="space-y-0.5">
                {section.pages.map((page) => {
                  const href = `/docs/${activeDocId}/${page.slug}`;
                  const isActive = location.pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        to={href}
                        onClick={() => dispatch(setSidebarOpen(false))}
                        className={cn(
                          'group block rounded-xl px-3.5 py-2.5 text-[13px] transition-all duration-200',
                          'relative overflow-hidden',
                          isActive
                            ? 'bg-gradient-to-r from-primary-50 to-primary-100/80 dark:from-primary-900/40 dark:to-primary-800/30 text-primary-700 dark:text-primary-300 font-semibold shadow-sm'
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/60 dark:hover:bg-surface-800/50 hover:text-neutral-900 dark:hover:text-neutral-100 hover:translate-x-0.5'
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-primary-700 rounded-r-full" />
                        )}
                        <span className="relative z-10">{page.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {idx < activeDoc.sections.length - 1 && (
                <div className="my-5 mx-2.5 border-t border-border-light/40 dark:border-border-dark/20" />
              )}
            </div>
          ))}
        </nav>
      </aside>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #374151;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
      `}</style>
    </>
  );
}
