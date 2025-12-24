import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Command } from 'cmdk';
import { closeSearch } from './searchSlice';
import { useNavigate } from 'react-router-dom';
import { docIndex } from '@/features/docs/docIndex';

const searchData = Object.entries(docIndex).flatMap(([docId, doc]) =>
  doc.sections.flatMap((section) =>
    section.pages.map((page) => ({
      title: page.title,
      href: `/docs/${docId}/${page.slug}`,
      category: doc.title,
    }))
  )
);

export function SearchCommand() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector((state) => state.search.isOpen);

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        dispatch(closeSearch());
        setTimeout(() => dispatch({ type: 'search/openSearch' }), 0);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [dispatch]);

  if (!isOpen) return null;

  const handleSelect = (href) => {
    navigate(href);
    dispatch(closeSearch());
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm">
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
        <Command
          className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-2xl overflow-hidden"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              dispatch(closeSearch());
            }
          }}
        >
          <div className="flex items-center border-b border-gray-200 dark:border-gray-800 px-4">
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="none">
              <path d="M8 12A4 4 0 1 0 8 4a4 4 0 0 0 0 8zM16 16l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <Command.Input
              placeholder="Search documentation..."
              className="flex-1 px-4 py-4 text-base bg-transparent border-0 focus:outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
            />
          </div>

          <Command.List className="max-h-96 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No results found.
            </Command.Empty>

            {Object.entries(
              searchData.reduce((acc, item) => {
                if (!acc[item.category]) acc[item.category] = [];
                acc[item.category].push(item);
                return acc;
              }, {})
            ).map(([category, items]) => (
              <Command.Group key={category} heading={category} className="mb-2">
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {category}
                </div>
                {items.map((item) => (
                  <Command.Item
                    key={item.href}
                    value={item.title}
                    onSelect={() => handleSelect(item.href)}
                    className="flex items-center gap-2 px-2 py-2 text-sm rounded-md cursor-pointer text-gray-700 dark:text-gray-300 aria-selected:bg-primary-50 dark:aria-selected:bg-primary-900/20 aria-selected:text-primary-600 dark:aria-selected:text-primary-400"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none">
                      <path d="M9 3h8M9 9h8M9 15h8M4 6h.01M4 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {item.title}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
