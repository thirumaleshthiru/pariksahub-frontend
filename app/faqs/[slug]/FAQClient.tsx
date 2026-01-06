'use client';

import React, { useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Question {
  _id?: string;
  question: string;
  answer: string;
  order?: number;
}

interface FAQClientProps {
  questions: Question[];
}

function detectLanguage(code: string): string {
  const codeLower = code.toLowerCase().trim();

  if (codeLower.includes('def ') || codeLower.includes('import ') ||
    codeLower.includes('print(') || codeLower.includes('if __name__') ||
    codeLower.includes('lambda ') || codeLower.includes('yield ')) {
    return 'python';
  }

  if (codeLower.includes('function ') || codeLower.includes('const ') ||
    codeLower.includes('let ') || codeLower.includes('console.log') ||
    codeLower.includes('=>') || codeLower.includes('require(')) {
    return 'javascript';
  }

  if (codeLower.includes('public class') || codeLower.includes('public static void') ||
    codeLower.includes('system.out.println')) {
    return 'java';
  }

  if (codeLower.includes('<html') || codeLower.includes('<!doctype') ||
    codeLower.includes('<div') || codeLower.includes('<p>')) {
    return 'html';
  }

  if (codeLower.includes('{') && codeLower.includes(':') &&
    (codeLower.includes('color') || codeLower.includes('margin') || codeLower.includes('padding'))) {
    return 'css';
  }

  return 'text';
}

function parseAnswerWithSyntaxHighlighting(
  html: string,
  questionId: string,
  onCopyCode: (code: string, blockId: string) => void,
  copied: string | null
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let codeBlockIndex = 0;

  const codeBlockRegex = /<pre[^>]*>([\s\S]*?)<\/pre>/g;
  let match;

  while ((match = codeBlockRegex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      const beforeHtml = html.substring(lastIndex, match.index);
      parts.push(
        <div
          key={`html-${lastIndex}`}
          className="faq-content text-white/80"
          dangerouslySetInnerHTML={{ __html: beforeHtml }}
        />
      );
    }

    let code = match[1];
    code = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/<br>/g, '\n')
      .trim();

    const language = detectLanguage(code);
    const blockId = `${questionId}-code-${codeBlockIndex}`;

    parts.push(
      <div key={`code-${match.index}`} className="my-4">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400 uppercase">{language}</span>
          </div>
          <button
            onClick={() => onCopyCode(code, blockId)}
            className="text-xs text-white hover:text-[#6366F1] flex items-center gap-1 cursor-pointer transition-colors"
          >
            {copied === blockId ? (
              <>
                <Check className="h-4 w-4 text-[#6366F1]" />
                <span className="font-bold text-[#6366F1]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="font-bold">Copy</span>
              </>
            )}
          </button>
        </div>
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            borderRadius: '0.5rem',
            padding: '1rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            margin: 0,
            backgroundColor: '#1e1e1e',
          }}
          PreTag="div"
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );

    lastIndex = match.index + match[0].length;
    codeBlockIndex++;
  }

  if (lastIndex < html.length) {
    const afterHtml = html.substring(lastIndex);
    parts.push(
      <div
        key={`html-${lastIndex}`}
        className="faq-content text-white/80"
        dangerouslySetInnerHTML={{ __html: afterHtml }}
      />
    );
  }

  if (parts.length === 0) {
    return [
      <div
        key="html-full"
        className="faq-content text-white/80"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    ];
  }

  return parts;
}

export default function FAQClient({ questions }: FAQClientProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <div className="space-y-6" role="list" aria-label="Frequently asked questions and answers">
      <style dangerouslySetInnerHTML={{
        __html: `
          .faq-content {
            overflow-wrap: break-word;
            word-break: break-word;
            max-width: 100%;
          }

          .faq-content p {
            margin-bottom: 0.75rem;
            line-height: 1.6;
            overflow-wrap: break-word;
            word-break: break-word;
          }
          
          .faq-content ul {
            list-style-type: disc !important;
            margin: 0.75rem 0 !important;
            padding-left: 1.5rem !important;
          }
          
          .faq-content ol {
            list-style-type: decimal !important;
            margin: 0.75rem 0 !important;
            padding-left: 1.5rem !important;
          }
          
          .faq-content li {
            margin-bottom: 0.25rem !important;
            line-height: 1.6 !important;
            display: list-item !important;
            overflow-wrap: break-word;
            word-break: break-word;
          }
          
          .faq-content strong {
            font-weight: 600;
            color: #ffffff;
            overflow-wrap: break-word;
            word-break: break-word;
          }
          
          .faq-content em {
            font-style: italic;
          }
          
          .faq-content u {
            text-decoration: underline;
          }
          
          .faq-content a {
            color: #6366F1;
            text-decoration: underline;
            overflow-wrap: break-word;
            word-break: break-word;
          }
          
          .faq-content a:hover {
            color: #8B5CF6;
          }
          
          .faq-content h1,
          .faq-content h2,
          .faq-content h3 {
            font-weight: 700;
            color: #ffffff;
            margin: 1rem 0 0.5rem 0;
            overflow-wrap: break-word;
            word-break: break-word;
          }
          
          .faq-content p {
            color: rgba(255, 255, 255, 0.8);
          }
          
          .faq-content li {
            color: rgba(255, 255, 255, 0.8);
          }
          
          .faq-content pre {
            display: none;
          }
        `
      }} />

      {questions.map((q, index) => {
        const questionId = q._id || `question-${index}`;
        const answerParts = useMemo(() =>
          parseAnswerWithSyntaxHighlighting(q.answer, questionId, copyCode, copied),
          [q.answer, questionId, copied]
        );

        return (
          <article
            id={`question-${index}`}
            key={q._id || index}
            className="bg-[#161B33] rounded-xl border border-gray-800 p-6 sm:p-8 hover:border-[#6366F1] transition-all scroll-mt-20"
            aria-labelledby={`faq-question-${index}`}
            role="article"
          >
            <div className="mb-4">
              <h3
                id={`faq-question-${index}`}
                className="text-lg sm:text-xl font-bold text-white leading-snug"
              >
                <span
                  className="inline-flex items-center justify-center w-6 h-6 bg-[#6366F1] text-white font-bold text-sm rounded-full align-middle mr-3 md:mr-2"
                  aria-label={`Question number ${index + 1}`}
                >
                  {index + 1}
                </span>
                {q.question}
              </h3>
            </div>

            <div
              className="md:ml-8"
              role="region"
              aria-label="Answer"
            >
              {answerParts}
            </div>
          </article>
        );
      })}
    </div>
  );
}
