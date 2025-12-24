import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { docIndex } from '@/features/docs/docIndex';

export function HomePage() {
  const docEntries = Object.entries(docIndex);
  const primaryDocId = docEntries[0]?.[0];
  const secondaryDocId = docEntries[1]?.[0] ?? primaryDocId;
  const primaryDoc = primaryDocId ? docIndex[primaryDocId] : null;
  const secondaryDoc = secondaryDocId ? docIndex[secondaryDocId] : null;
  const primaryHref = primaryDocId && primaryDoc ? `/docs/${primaryDocId}/${primaryDoc.defaultSlug}` : '/docs';
  const secondaryHref = secondaryDocId && secondaryDoc ? `/docs/${secondaryDocId}/${secondaryDoc.defaultSlug}` : '/docs';

  return (
    <div className="min-h-screen bg-base-0 dark:bg-surface-900 text-neutral-900 dark:text-neutral-100">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.05fr,0.95fr] items-start max-w-6xl mx-auto">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border-light dark:border-border-dark/60 bg-surface-50 dark:bg-surface-900 px-3 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">
              Built for docs-first teams
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-semibold leading-tight text-neutral-900 dark:text-neutral-50">
                Calm, readable documentation that stays modern.
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl">
                RuntimeMind gives you a developer-first knowledge base with thoughtful typography, steady rhythms, and an architecture ready for blogging and future auth.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to={primaryHref}>
                <Button size="lg" className="text-sm font-semibold">
                  Start reading
                </Button>
              </Link>
              <Link to={secondaryHref}>
                <Button size="lg" variant="outline" className="text-sm">
                  Explore another track
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[{
                title: 'Reading-first UI',
                body: 'Tight line lengths, careful contrast, calm surfaces.',
              }, {
                title: 'Modern stack',
                body: 'React, Redux Toolkit, React Query, Tailwind—production ready.',
              }, {
                title: 'Future-friendly',
                body: 'Built to extend into blogging, auth, and profiles without rewrites.',
              }].map((item) => (
                <div key={item.title} className="rounded-xl border border-border-light dark:border-border-dark/50 bg-surface-0 dark:bg-surface-900 p-4 shadow-card">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-2">{item.title}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[{
                label: 'Tracks',
                value: docEntries.length.toString().padStart(2, '0'),
              }, {
                label: 'Markdown-native',
                value: 'Content',
              }, {
                label: 'Dark / Light',
                value: 'Auto',
              }, {
                label: 'Cmd Palette',
                value: '⌘K / Ctrl+K',
              }].map((item) => (
                <div key={item.label} className="rounded-lg border border-border-light dark:border-border-dark/50 bg-surface-0 dark:bg-surface-900 p-3 text-sm text-neutral-700 dark:text-neutral-200 flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-neutral-500 dark:text-neutral-400">{item.label}</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-50">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border-light dark:border-border-dark/50 bg-surface-0 dark:bg-surface-900 shadow-soft p-6">
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                <span>Preview</span>
                <span>Docs layout</span>
              </div>
              <div className="rounded-xl border border-border-light dark:border-border-dark/50 bg-surface-50 dark:bg-surface-900 p-4 space-y-3">
                <div className="h-3 w-24 rounded-full bg-primary-100 dark:bg-primary-900/30" />
                <div className="h-3 w-40 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-3 w-52 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-px bg-border-light dark:bg-border-dark/60 my-2" />
                <div className="space-y-2">
                  <div className="h-2.5 w-full rounded-full bg-primary-100 dark:bg-primary-900/30" />
                  <div className="h-2.5 w-11/12 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                  <div className="h-2.5 w-10/12 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border-light dark:border-border-dark/50 bg-surface-0 dark:bg-surface-900 p-6 space-y-4">
              <div className="text-xs uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">What you get</div>
              <ul className="space-y-3 text-sm text-neutral-700 dark:text-neutral-200">
                <li className="flex items-start gap-2"><span className="mt-[3px] h-2 w-2 rounded-full bg-primary-500" />Readable docs with markdown, code blocks, and tables.</li>
                <li className="flex items-start gap-2"><span className="mt-[3px] h-2 w-2 rounded-full bg-primary-500" />Sidebar navigation with categories and responsive layout.</li>
                <li className="flex items-start gap-2"><span className="mt-[3px] h-2 w-2 rounded-full bg-primary-500" />Command palette search (⌘K / Ctrl+K).</li>
                <li className="flex items-start gap-2"><span className="mt-[3px] h-2 w-2 rounded-full bg-primary-500" />Light/dark mode with persistent preference.</li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
