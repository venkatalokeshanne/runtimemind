import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { Highlight, themes } from 'prism-react-renderer';
import { useSelector } from 'react-redux';

function CodeBlock({ children, className }) {
  const theme = useSelector((state) => state.theme.mode);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  if (!language) {
    return (
      <code className="px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-900/20 text-sm font-mono text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-900/40">
        {children}
      </code>
    );
  }

  return (
    <Highlight
      theme={theme === 'dark' ? themes.nightOwl : themes.github}
      code={String(children).trim()}
      language={language}
    >
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre
          style={style}
          className="rounded-xl p-4 overflow-x-auto text-sm my-4 border border-border-light dark:border-border-dark shadow-sm"
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}

export function MarkdownRenderer({ content }) {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={{
          code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return <CodeBlock className={className}>{children}</CodeBlock>;
          },
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold mt-6 mb-3 bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-neutral-50 dark:to-neutral-300 bg-clip-text text-transparent">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="group text-3xl font-bold mt-8 mb-3 text-neutral-900 dark:text-neutral-50 pb-2 border-b-2 border-gradient-to-r from-primary-500 to-accent-500 relative">
              <span className="absolute bottom-0 left-0 h-0.5 w-16 bg-gradient-to-r from-primary-500 to-accent-500" />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-semibold mt-6 mb-2 text-neutral-900 dark:text-neutral-50">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 my-3">
              {children}
            </p>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline decoration-primary-300 dark:decoration-primary-700 underline-offset-2 font-medium transition-colors"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="space-y-2 my-3 text-neutral-700 dark:text-neutral-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 my-3 text-neutral-700 dark:text-neutral-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex-shrink-0" />
              <span>{children}</span>
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="relative pl-6 py-2 my-4 italic text-neutral-700 dark:text-neutral-300 bg-gradient-to-r from-primary-50/50 to-accent-50/30 dark:from-primary-900/10 dark:to-accent-900/5 rounded-r-lg">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-accent-500 rounded-l" />
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-border-light dark:border-border-dark shadow-sm">
              <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900 dark:text-neutral-100 bg-gradient-to-r from-surface-50 to-primary-50/30 dark:from-surface-900 dark:to-primary-900/10">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 border-t border-border-light dark:border-border-dark">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
