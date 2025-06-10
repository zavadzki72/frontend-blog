
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Customizar componentes específicos se necessário
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <pre className="bg-muted/70 p-6 rounded-lg overflow-x-auto mb-6 border border-border/50">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-primary" {...props}>
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <table className="markdown-table w-full border-collapse mb-4 border border-muted-foreground/20 rounded-lg overflow-hidden">
              {children}
            </table>
          ),
          th: ({ children }) => (
            <th className="bg-muted/50 px-4 py-2 text-left font-semibold border-b border-muted-foreground/20">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 border-b border-muted-foreground/10">
              {children}
            </td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-6 pr-4 py-4 italic bg-muted/30 rounded-r-lg mb-6 text-muted-foreground">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="markdown-list mb-6 ml-0 pl-6 space-y-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="markdown-list mb-6 ml-0 pl-6 space-y-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="markdown-list-item mb-2 leading-relaxed">
              {children}
            </li>
          ),
          h1: ({ children }) => (
            <h1 className="text-3xl mb-6 mt-8 first:mt-0 font-archivo font-semibold">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl mb-4 mt-6 font-archivo font-semibold">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl mb-3 mt-5 font-archivo font-semibold">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg mb-3 mt-4 font-archivo font-semibold">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-base mb-2 mt-3 font-archivo font-semibold">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm mb-2 mt-3 font-archivo font-semibold">
              {children}
            </h6>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed">
              {children}
            </p>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors underline"
            >
              {children}
            </a>
          ),
          hr: () => (
            <hr className="border-muted-foreground/20 my-8 border-t-2" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
