'use client';

import React, { useMemo } from 'react';
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

// Function to detect language from code content
function detectLanguage(code: string): string {
  const codeLower = code.toLowerCase().trim();
  
  // Python indicators
  if (codeLower.includes('def ') || codeLower.includes('import ') || 
      codeLower.includes('print(') || codeLower.includes('if __name__') ||
      codeLower.includes('lambda ') || codeLower.includes('yield ')) {
    return 'python';
  }
  
  // JavaScript indicators
  if (codeLower.includes('function ') || codeLower.includes('const ') || 
      codeLower.includes('let ') || codeLower.includes('console.log') ||
      codeLower.includes('=>') || codeLower.includes('require(')) {
    return 'javascript';
  }
  
  // Java indicators
  if (codeLower.includes('public class') || codeLower.includes('public static void') ||
      codeLower.includes('system.out.println')) {
    return 'java';
  }
  
  // HTML indicators
  if (codeLower.includes('<html') || codeLower.includes('<!doctype') ||
      codeLower.includes('<div') || codeLower.includes('<p>')) {
    return 'html';
  }
  
  // CSS indicators
  if (codeLower.includes('{') && codeLower.includes(':') && 
      (codeLower.includes('color') || codeLower.includes('margin') || codeLower.includes('padding'))) {
    return 'css';
  }
  
  // Default to text if can't detect
  return 'text';
}

// Function to parse HTML and replace code blocks with syntax-highlighted versions
function parseAnswerWithSyntaxHighlighting(html: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // Regex to match <pre><code>...</code></pre> blocks
  const codeBlockRegex = /<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g;
  let match;
  
  while ((match = codeBlockRegex.exec(html)) !== null) {
    // Add content before the code block
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
    
    // Extract and clean the code
    let code = match[1];
    // Decode HTML entities
    code = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    // Detect language
    const language = detectLanguage(code);
    
    // Add syntax-highlighted code block
    parts.push(
      <div key={`code-${match.index}`} className="my-4">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            borderRadius: '0.5rem',
            padding: '1rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            margin: '0.75rem 0',
            backgroundColor: '#1e1e1e',
          }}
          PreTag="div"
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining content after the last code block
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
  
  // If no code blocks found, return original HTML
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
  return (
    <div className="space-y-6" role="list" aria-label="Frequently asked questions and answers">
      <style dangerouslySetInnerHTML={{
        __html: `
          .faq-content p {
            margin-bottom: 0.75rem;
            line-height: 1.6;
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
          }
          
          .faq-content strong {
            font-weight: 600;
            color: #ffffff;
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
          }
          
          .faq-content p {
            color: rgba(255, 255, 255, 0.8);
          }
          
          .faq-content li {
            color: rgba(255, 255, 255, 0.8);
          }
        `
      }} />
      
      {questions.map((q, index) => {
        const answerParts = useMemo(() => parseAnswerWithSyntaxHighlighting(q.answer), [q.answer]);
        
        return (
          <article
            key={q._id || index}
            className="bg-[#161B33] rounded-xl border border-gray-800 p-6 sm:p-8 hover:border-[#6366F1] transition-all"
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

