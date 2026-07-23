import React from 'react';

/**
 * Parses markdown text into formatted JSX elements (bold, headers, lists, code, blockquotes).
 * Handles line-by-line block parsing so headings and list items render properly.
 */
export function FormattedMarkdown({ content, className = '' }) {
  if (!content) return null;
  const textContent = typeof content === 'string' ? content : String(content);

  // Normalize line endings
  const normalized = textContent.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');

  const elements = [];
  let i = 0;
  let keyCounter = 0;

  // Inline formatting parser (**bold**, *italic*, `code`, [link](url))
  const parseInline = (text) => {
    if (!text) return '';

    const regex = /(\*\*[\s\S]+?\*\*|__[\s\S]+?__|`[\s\S]+?`|\[[^\]]+\]\([^)]+\)|\*[^\*]+?\*|_[^_]+?_)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const token = match[0];
      if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
        const inner = token.slice(2, -2);
        parts.push(
          <strong key={key++} className="font-extrabold text-slate-900">
            {parseInline(inner)}
          </strong>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        const inner = token.slice(1, -1);
        parts.push(
          <code key={key++} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] text-emerald-700 font-semibold">
            {inner}
          </code>
        );
      } else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
        const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
          parts.push(
            <a
              key={key++}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 underline font-semibold"
            >
              {linkMatch[1]}
            </a>
          );
        } else {
          parts.push(token);
        }
      } else if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_'))) {
        const inner = token.slice(1, -1);
        parts.push(
          <em key={key++} className="italic text-slate-700">
            {parseInline(inner)}
          </em>
        );
      } else {
        parts.push(token);
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines (act as block separators)
    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Fenced Code Blocks (``` lang ... ```)
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      elements.push(
        <div key={keyCounter++} className="my-2.5 rounded-xl overflow-hidden bg-slate-900 text-slate-100 text-xs border border-slate-800">
          {lang && (
            <div className="px-3 py-1 bg-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-700">
              {lang}
            </div>
          )}
          <pre className="p-3 overflow-x-auto font-mono text-[11px] leading-relaxed">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      continue;
    }

    // 2. Horizontal Rule (---, ***, ___)
    if (/^(---|[*]{3,}|_{3,})$/.test(trimmed)) {
      elements.push(
        <hr key={keyCounter++} className="my-3 border-t border-slate-200" />
      );
      i++;
      continue;
    }

    // 3. Headers (# H1, ## H2, ### H3, #### H4)
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={keyCounter++} className="font-black text-base sm:text-lg text-slate-900 mt-3 mb-1.5 leading-snug">
          {parseInline(trimmed.replace(/^#\s+/, ''))}
        </h1>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={keyCounter++} className="font-extrabold text-sm sm:text-base text-slate-900 mt-3 mb-1.5 border-b border-slate-200 pb-1 leading-snug">
          {parseInline(trimmed.replace(/^##\s+/, ''))}
        </h2>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={keyCounter++} className="font-extrabold text-xs sm:text-sm text-slate-900 mt-2.5 mb-1 leading-snug">
          {parseInline(trimmed.replace(/^###\s+/, ''))}
        </h3>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4 key={keyCounter++} className="font-bold text-xs text-slate-800 mt-2 mb-1">
          {parseInline(trimmed.replace(/^####\s+/, ''))}
        </h4>
      );
      i++;
      continue;
    }

    // 4. Blockquotes (> quote)
    if (trimmed.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      elements.push(
        <blockquote key={keyCounter++} className="pl-3.5 border-l-3 border-emerald-500 italic text-slate-600 my-2 bg-emerald-50/40 py-2 px-3 rounded-r-xl text-xs leading-relaxed">
          {parseInline(quoteLines.join(' '))}
        </blockquote>
      );
      continue;
    }

    // 5. Unordered List (- item, * item, + item)
    if (/^\s*[\-\*\+]\s+/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^\s*[\-\*\+]\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^\s*[\-\*\+]\s+/, '');
        listItems.push(itemText);
        i++;
      }
      elements.push(
        <ul key={keyCounter++} className="space-y-1.5 my-2 pl-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[13.5px] leading-relaxed text-slate-700">
              <span className="text-emerald-600 font-bold select-none mt-0.5 text-xs">•</span>
              <span className="flex-1 min-w-0">{parseInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 6. Ordered List (1. item, 2. item)
    if (/^\s*\d+\.\s+/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^\s*\d+\.\s+/, '');
        listItems.push(itemText);
        i++;
      }
      elements.push(
        <ol key={keyCounter++} className="space-y-1.5 my-2 pl-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[13.5px] leading-relaxed text-slate-700">
              <span className="font-bold text-emerald-700 font-mono text-[10px] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded select-none mt-0.5">
                {idx + 1}
              </span>
              <span className="flex-1 min-w-0">{parseInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 7. Regular Paragraph (gather consecutive paragraph lines)
    const paragraphLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('>') &&
      !/^(---|[*]{3,}|_{3,})$/.test(lines[i].trim()) &&
      !/^\s*[\-\*\+]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }

    if (paragraphLines.length > 0) {
      elements.push(
        <p key={keyCounter++} className="my-1.5 leading-relaxed text-[13.5px] text-slate-700">
          {paragraphLines.map((pLine, pIdx) => (
            <React.Fragment key={pIdx}>
              {parseInline(pLine)}
              {pIdx < paragraphLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      );
    }
  }

  return (
    <div className={`space-y-1.5 text-slate-800 ${className}`}>
      {elements}
    </div>
  );
}

