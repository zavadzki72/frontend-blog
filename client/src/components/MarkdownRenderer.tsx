import { useEffect, useState } from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    // Simple markdown to HTML conversion
    // In a real app, you might want to use a library like react-markdown
    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      // Code
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Lists
      .replace(/^\s*[-*+]\s+(.*)$/gim, '<li>$1</li>')
      // Wrap lists
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      // Paragraphs
      .replace(/\n\n/gim, '</p><p>')
      // Line breaks
      .replace(/\n/gim, '<br/>');

    // Wrap in paragraph tags
    if (html && !html.startsWith('<')) {
      html = `<p>${html}</p>`;
    }

    setHtmlContent(html);
  }, [content]);

  return (
    <div 
      className={`markdown-content prose prose-gray dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
