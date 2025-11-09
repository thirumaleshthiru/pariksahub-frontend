'use client';

import React, { useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ContentBlock {
  type: 'code' | 'text';
  code?: string;
  language?: string;
  text_content?: string;
  order?: number;
  label?: string;
}

interface Question {
  _id?: string;
  title: string;
  description?: string;
  difficulty?: string;
  content_blocks?: ContentBlock[];
  order?: number;
}

interface QuestionClientProps {
  questions: Question[];
}

// Function to detect language from code content
function detectLanguage(code: string, providedLanguage?: string): string {
  if (providedLanguage) {
    return providedLanguage.toLowerCase();
  }
  
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
  
  // C/C++ indicators
  if (codeLower.includes('#include') || codeLower.includes('int main') ||
      codeLower.includes('printf') || codeLower.includes('std::')) {
    return 'cpp';
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
function parseDescriptionWithSyntaxHighlighting(html: string): React.ReactNode[] {
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
          className="prose-custom text-white/80"
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
        className="prose-custom text-white/80"
        dangerouslySetInnerHTML={{ __html: afterHtml }}
      />
    );
  }
  
  // If no code blocks found, return original HTML
  if (parts.length === 0) {
    return [
      <div 
        key="html-full"
        className="prose-custom text-white/80"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    ];
  }
  
  return parts;
}

export default function QuestionClient({ questions }: QuestionClientProps) {
  const [copied, setCopied] = React.useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-8" role="list" aria-label="Programming questions with code examples">
      <style dangerouslySetInnerHTML={{
        __html: `
          .prose-custom p {
            margin-bottom: 0.75rem;
            line-height: 1.6;
          }
          
          .prose-custom ul {
            list-style-type: disc !important;
            margin: 0.75rem 0 !important;
            padding-left: 1.5rem !important;
          }
          
          .prose-custom ol {
            list-style-type: decimal !important;
            margin: 0.75rem 0 !important;
            padding-left: 1.5rem !important;
          }
          
          .prose-custom li {
            margin-bottom: 0.25rem !important;
            line-height: 1.6 !important;
            display: list-item !important;
          }
          
          .prose-custom strong {
            font-weight: 600;
            color: #ffffff;
          }
          
          .prose-custom em {
            font-style: italic;
          }
          
          .prose-custom u {
            text-decoration: underline;
          }
          
          .prose-custom a {
            color: #6366F1;
            text-decoration: underline;
          }
          
          .prose-custom a:hover {
            color: #8B5CF6;
          }
          
          .prose-custom h1,
          .prose-custom h2,
          .prose-custom h3 {
            font-weight: 700;
            color: #ffffff;
            margin: 1rem 0 0.5rem 0;
          }
          
          .prose-custom p {
            color: rgba(255, 255, 255, 0.8);
          }
          
          .prose-custom li {
            color: rgba(255, 255, 255, 0.8);
          }
        `
      }} />
      
      {questions.map((question, index) => {
        // Sort content blocks by order
        const sortedBlocks = question.content_blocks 
          ? [...question.content_blocks].sort((a, b) => (a.order || 0) - (b.order || 0))
          : [];

        return (
          <article
            id={`question-${index}`}
            key={question._id || index}
            className="bg-[#161B33] rounded-xl border border-gray-800 p-6 sm:p-8 hover:border-[#6366F1] transition-all scroll-mt-20"
            aria-labelledby={`question-title-${index}`}
            role="article"
          >
            <div className="mb-6">
              <div className="flex items-start gap-3 mb-3">
                <span 
                  className="inline-flex items-center justify-center w-8 h-8 bg-[#6366F1] text-white font-bold text-sm rounded-full flex-shrink-0"
                  aria-label={`Question number ${index + 1}`}
                >
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h2 
                    id={`question-title-${index}`}
                    className="text-xl sm:text-2xl font-bold text-white leading-snug mb-2"
                  >
                    {question.title}
                  </h2>
                  {question.difficulty && (
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-[#0A0E27] border border-gray-700 rounded-lg text-white">
                      {question.difficulty}
                    </span>
                  )}
                </div>
              </div>
              
              {question.description && (
                <div className="ml-11 mb-4">
                  {parseDescriptionWithSyntaxHighlighting(question.description)}
                </div>
              )}
            </div>
            
            {/* Content Blocks */}
            {sortedBlocks.length > 0 && (
              <div className="ml-11 space-y-4">
                {sortedBlocks.map((block, blockIndex) => {
                  if (block.type === 'code') {
                    const codeLanguage = detectLanguage(block.code || '', block.language);
                    const blockId = `${question._id || index}-${blockIndex}`;
                    
                    return (
                      <div key={blockIndex} className="relative">
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-800">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-gray-400 uppercase">{codeLanguage}</span>
                            {block.label && (
                              <span className="text-xs text-gray-500">- {block.label}</span>
                            )}
                          </div>
                          <button
                            onClick={() => copyCode(block.code || '', blockId)}
                            className="text-xs text-white hover:text-[#6366F1] flex items-center gap-1 cursor-pointer transition-colors"
                            aria-label={copied === blockId ? 'Code copied to clipboard' : 'Copy code to clipboard'}
                          >
                            {copied === blockId ? (
                              <>
                                <Check className="h-4 w-4 text-[#6366F1]" aria-hidden="true" />
                                <span className="font-bold text-[#6366F1]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" aria-hidden="true" />
                                <span className="font-bold">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="my-2">
                          <SyntaxHighlighter
                            language={codeLanguage}
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
                            {block.code || ''}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div key={blockIndex} className="prose-custom text-white/80">
                        {parseDescriptionWithSyntaxHighlighting(block.text_content || '')}
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

