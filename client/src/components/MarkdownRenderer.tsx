
import { useEffect, useState } from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    const parseMarkdown = (markdown: string): string => {
      let html = markdown;

      // Escape HTML tags first to prevent conflicts
      const htmlEntities: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };

      // Process code blocks first (to preserve their content)
      const codeBlocks: string[] = [];
      html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const placeholder = `__CODEBLOCK_${codeBlocks.length}__`;
        const escapedCode = code.replace(/[&<>"']/g, (char: string) => htmlEntities[char]);
        const languageClass = lang ? ` class="language-${lang}"` : '';
        codeBlocks.push(`<pre><code${languageClass}>${escapedCode}</code></pre>`);
        return placeholder;
      });

      // Process inline code
      const inlineCodes: string[] = [];
      html = html.replace(/`([^`\n]+)`/g, (match, code) => {
        const placeholder = `__INLINECODE_${inlineCodes.length}__`;
        const escapedCode = code.replace(/[&<>"']/g, (char: string) => htmlEntities[char]);
        inlineCodes.push(`<code>${escapedCode}</code>`);
        return placeholder;
      });

      // Headers (must be processed before other formatting)
      html = html.replace(/^#{6}\s+(.+)$/gm, '<h6>$1</h6>');
      html = html.replace(/^#{5}\s+(.+)$/gm, '<h5>$1</h5>');
      html = html.replace(/^#{4}\s+(.+)$/gm, '<h4>$1</h4>');
      html = html.replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>');
      html = html.replace(/^#{2}\s+(.+)$/gm, '<h2>$1</h2>');
      html = html.replace(/^#{1}\s+(.+)$/gm, '<h1>$1</h1>');

      // Bold and Italic
      html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

      // Links
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

      // Horizontal rules
      html = html.replace(/^---+$/gm, '<hr>');

      // Tables
      html = html.replace(/\|(.+)\|\s*\n\|[\s\-\|:]+\|\s*\n((?:\|.+\|\s*\n?)*)/g, (match, header, rows) => {
        const headerCells = header.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell);
        const headerHtml = headerCells.map((cell: string) => `<th>${cell}</th>`).join('');
        
        const rowsHtml = rows.trim().split('\n').map((row: string) => {
          const cells = row.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell);
          return `<tr>${cells.map((cell: string) => `<td>${cell}</td>`).join('')}</tr>`;
        }).join('');

        return `<table class="markdown-table"><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>`;
      });

      // Lists (unordered) - improved handling
      html = html.replace(/^[\s]*[-*+]\s+(.+)$/gm, (match, content, offset, string) => {
        return `<li class="markdown-list-item">${content}</li>`;
      });
      
      // Lists (ordered) - improved handling
      html = html.replace(/^[\s]*\d+\.\s+(.+)$/gm, (match, content) => {
        return `<li class="markdown-list-item markdown-ordered-item">${content}</li>`;
      });

      // Group consecutive list items
      html = html.replace(/((?:<li class="markdown-list-item"[^>]*>.*?<\/li>\s*)+)/g, (match) => {
        if (match.includes('markdown-ordered-item')) {
          return `<ol class="markdown-list">${match}</ol>`;
        }
        return `<ul class="markdown-list">${match}</ul>`;
      });

      // Blockquotes
      html = html.replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>');
      html = html.replace(/((?:<blockquote>.*<\/blockquote>\s*)+)/g, '<blockquote>$1</blockquote>');
      html = html.replace(/<blockquote><blockquote>/g, '<blockquote>');
      html = html.replace(/<\/blockquote><\/blockquote>/g, '</blockquote>');

      // Line breaks and paragraphs
      html = html.replace(/\n\n/g, '</p><p>');
      html = html.replace(/\n/g, '<br>');

      // Wrap content in paragraphs (avoid wrapping block elements)
      if (html && !html.match(/^<(?:h[1-6]|ul|ol|table|blockquote|pre|hr)/)) {
        html = `<p>${html}</p>`;
      }

      // Clean up empty paragraphs
      html = html.replace(/<p><\/p>/g, '');
      html = html.replace(/<p>(<(?:h[1-6]|ul|ol|table|blockquote|pre|hr)[^>]*>.*?<\/(?:h[1-6]|ul|ol|table|blockquote|pre|hr)>)<\/p>/g, '$1');

      // Restore code blocks
      codeBlocks.forEach((codeBlock, index) => {
        html = html.replace(`__CODEBLOCK_${index}__`, codeBlock);
      });

      // Restore inline codes
      inlineCodes.forEach((inlineCode, index) => {
        html = html.replace(`__INLINECODE_${index}__`, inlineCode);
      });

      return html;
    };

    setHtmlContent(parseMarkdown(content));
  }, [content]);

  return (
    <div 
      className={`markdown-content prose prose-gray dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
