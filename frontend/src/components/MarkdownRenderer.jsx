import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="max-w-none markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Code blocks
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              className="rounded-lg my-4"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code
              className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-blue-300"
              {...props}
            >
              {children}
            </code>
          );
        },
        // Tables
        table({ children }) {
          return (
            <div className="overflow-x-auto my-4 rounded-lg border border-slate-700">
              <table className="min-w-full divide-y divide-slate-700">
                {children}
              </table>
            </div>
          );
        },
        thead({ children }) {
          return <thead className="bg-slate-800/80">{children}</thead>;
        },
        tbody({ children }) {
          return <tbody className="bg-slate-900/40 divide-y divide-slate-800">{children}</tbody>;
        },
        tr({ children }) {
          return <tr className="hover:bg-slate-800/30 transition-colors">{children}</tr>;
        },
        th({ children, style, ...props }) {
          return (
            <th
              className="px-4 py-2.5 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider whitespace-nowrap"
              {...props}
            >
              {children}
            </th>
          );
        },
        td({ children, style, ...props }) {
          return (
            <td
              className="px-4 py-2.5 text-sm text-slate-300 whitespace-nowrap"
              {...props}
            >
              {children}
            </td>
          );
        },
        // Lists
        ul({ children }) {
          return <ul className="space-y-1.5 my-3">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="space-y-1.5 my-3">{children}</ol>;
        },
        li({ children }) {
          return <li className="text-slate-300 leading-relaxed">{children}</li>;
        },
        // Headings
        h1({ children }) {
          return <h1 className="text-xl font-bold mt-4 mb-2 text-white border-b border-slate-700 pb-2">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-lg font-bold mt-4 mb-2 text-blue-400">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-base font-semibold mt-3 mb-1.5 text-slate-200">{children}</h3>;
        },
        // Paragraphs
        p({ children }) {
          return <p className="mb-3 leading-relaxed text-slate-300">{children}</p>;
        },
        // Strong/Bold
        strong({ children }) {
          return <strong className="font-bold text-blue-300">{children}</strong>;
        },
        // Blockquote
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-white/5 rounded-r-lg">
              {children}
            </blockquote>
          );
        },
        // Links
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              {children}
            </a>
          );
        },
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
