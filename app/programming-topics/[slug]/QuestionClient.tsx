'use client';

import React, { useState, useEffect } from 'react';
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

function parseDescriptionWithSyntaxHighlighting(html: string): React.ReactNode[] {
  if (!html || typeof html !== 'string') return [];

  html = html
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '<br>')
    .replace(/(<\/p>)\s*(<p>)/gi, '$1$2')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let matchIndex = 0;
  
  const codeBlockMatches: Array<{index: number, length: number, code: string, isBlock: boolean}> = [];
  
  const qlContainerRegex = /<div[^>]*class="ql-code-block-container"[^>]*>([\s\S]*?)<\/div>/g;
  let match: RegExpExecArray | null;
  while ((match = qlContainerRegex.exec(html)) !== null) {
    const containerStart = match.index;
    const containerContent = match[1];
    const containerOpeningTag = match[0].substring(0, match[0].indexOf('>') + 1);
    const containerStartOffset = containerOpeningTag.length;
    
    const qlBlockRegex = /<div[^>]*class="ql-code-block"[^>]*>([\s\S]*?)<\/div>/g;
    let blockMatch: RegExpExecArray | null;
    while ((blockMatch = qlBlockRegex.exec(containerContent)) !== null) {
      let code = blockMatch[1]
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
      
      codeBlockMatches.push({
        index: containerStart + containerStartOffset + blockMatch.index,
        length: blockMatch[0].length,
        code: code,
        isBlock: true
      });
    }
  }
  
  const qlBlockStandaloneRegex = /<div[^>]*class="ql-code-block"[^>]*>([\s\S]*?)<\/div>/g;
  match = null;
  while ((match = qlBlockStandaloneRegex.exec(html)) !== null) {
    const isAlreadyCaptured = codeBlockMatches.some(cb => 
      match!.index >= cb.index && match!.index < cb.index + cb.length
    );
    
    if (!isAlreadyCaptured) {
      let code = match[1]
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
      
      codeBlockMatches.push({
        index: match.index,
        length: match[0].length,
        code: code,
        isBlock: true
      });
    }
  }
  
  const codeBlockRegex = /<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g;
  match = null;
  while ((match = codeBlockRegex.exec(html)) !== null) {
    let code = match[1]
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
    
    codeBlockMatches.push({
      index: match.index,
      length: match[0].length,
      code: code,
      isBlock: true
    });
  }
  
  const inlineCodeRegex = /<code[^>]*>([\s\S]*?)<\/code>/g;
  while ((match = inlineCodeRegex.exec(html)) !== null) {
    const isInsidePre = codeBlockMatches.some(cb => 
      match!.index >= cb.index && match!.index < cb.index + cb.length
    );
    
    if (!isInsidePre) {
      let code = match[1]
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
      
      codeBlockMatches.push({
        index: match.index,
        length: match[0].length,
        code: code,
        isBlock: false
      });
    }
  }
  
  codeBlockMatches.sort((a, b) => a.index - b.index);
  
  for (const codeMatch of codeBlockMatches) {
    if (codeMatch.index > lastIndex) {
      const beforeHtml = html.substring(lastIndex, codeMatch.index);
      if (beforeHtml.trim()) {
        parts.push(
          <div 
            key={`html-${matchIndex}-${lastIndex}`}
            className="prose-custom text-white/80"
            dangerouslySetInnerHTML={{ __html: beforeHtml }}
            suppressHydrationWarning
          />
        );
      }
    }
    
    if (codeMatch.isBlock) {
      parts.push(
        <div key={`code-block-${matchIndex}-${codeMatch.index}`} className="my-2">
          <SyntaxHighlighter
            language="text"
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
            {codeMatch.code}
          </SyntaxHighlighter>
        </div>
      );
    } else {
      parts.push(
        <code 
          key={`code-inline-${matchIndex}-${codeMatch.index}`}
          style={{
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4',
            padding: '0.125rem 0.375rem',
            borderRadius: '0.25rem',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            border: '1px solid #3e3e3e',
            display: 'inline',
          }}
        >
          {codeMatch.code}
        </code>
      );
    }
    
    lastIndex = codeMatch.index + codeMatch.length;
    matchIndex++;
  }
  
  if (lastIndex < html.length) {
    const afterHtml = html.substring(lastIndex);
    if (afterHtml.trim()) {
      parts.push(
        <div 
          key={`html-${matchIndex}-${lastIndex}`}
          className="prose-custom text-white/80"
          dangerouslySetInnerHTML={{ __html: afterHtml }}
          suppressHydrationWarning
        />
      );
    }
  }
  
  if (parts.length === 0 && html.trim()) {
    return [
      <div 
        key="html-full"
        className="prose-custom text-white/80"
        dangerouslySetInnerHTML={{ __html: html }}
        suppressHydrationWarning
      />
    ];
  }
  
  return parts;
}

export default function QuestionClient({ questions }: QuestionClientProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const copyCode = (code: string, id: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  if (!isMounted) {
    return (
      <div className="space-y-8">
        {questions.map((question, index) => (
          <article
            key={question._id || `question-${index}`}
            className="bg-[#161B33] rounded-xl border border-gray-800 p-6 sm:p-8"
          >
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <style dangerouslySetInnerHTML={{
        __html: `
          .prose-custom p {
            margin-bottom: 0.5rem;
            line-height: 1.6;
          }
          
          .prose-custom ul {
            list-style-type: disc !important;
            margin: 0.5rem 0 !important;
            padding-left: 1.5rem !important;
          }
          
          .prose-custom ol {
            list-style-type: decimal !important;
            margin: 0.5rem 0 !important;
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
          
          .prose-custom br {
            display: block;
            content: "";
            margin: 0.25rem 0;
          }
          
          .prose-custom img {
            max-width: 100% !important;
            max-height: 500px !important;
            width: auto !important;
            height: auto !important;
            display: block !important;
            margin: 1rem auto !important;
            border-radius: 0.5rem;
            object-fit: contain;
          }
          
          .prose-custom pre {
            margin: 0 !important;
            background-color: #1e1e1e !important;
            color: #d4d4d4 !important;
          }
          
          .prose-custom code {
            margin: 0 !important;
            background-color: #1e1e1e !important;
            color: #d4d4d4 !important;
          }
        `
      }} />
      
      {questions.map((question, index) => {
        const sortedBlocks = question.content_blocks 
          ? [...question.content_blocks].sort((a, b) => (a.order || 0) - (b.order || 0))
          : [];

        const questionId = question._id || `question-${index}`;

        // Group consecutive code blocks with different languages
        const groups: Array<{type: 'code-group', blocks: ContentBlock[]} | {type: 'single', block: ContentBlock}> = [];
        let currentCodeGroup: ContentBlock[] = [];
        
        sortedBlocks.forEach((block, idx) => {
          if (block.type === 'code') {
            currentCodeGroup.push(block);
            // Check if next block is not code or is last block
            if (idx === sortedBlocks.length - 1 || sortedBlocks[idx + 1].type !== 'code') {
              // Only group if there are multiple code blocks with different languages
              const uniqueLanguages = new Set(currentCodeGroup.map(b => b.language?.toLowerCase()));
              if (currentCodeGroup.length > 1 && uniqueLanguages.size > 1) {
                groups.push({type: 'code-group', blocks: [...currentCodeGroup]});
              } else {
                // Add each as single block
                currentCodeGroup.forEach(b => groups.push({type: 'single', block: b}));
              }
              currentCodeGroup = [];
            }
          } else {
            groups.push({type: 'single', block});
          }
        });

        return (
          <article
            id={`question-${index}`}
            key={questionId}
            className="bg-[#161B33] rounded-xl border border-gray-800 p-6 sm:p-8 hover:border-[#6366F1] transition-all scroll-mt-20"
          >
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed mb-3">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-[#6366F1] text-white font-bold text-sm rounded-full align-middle mr-3 md:mr-2">
                  {index + 1}
                </span>
                {question.title.replace(/<[^>]*>/g, '')}
              </h2>
              {question.difficulty && (
                <span className="inline-block px-3 py-1 text-xs font-medium bg-[#0A0E27] border border-gray-700 rounded-lg text-white mb-4">
                  {question.difficulty}
                </span>
              )}
              
              {question.description && (
                <div className="sm:ml-11 mb-4">
                  {parseDescriptionWithSyntaxHighlighting(question.description)}
                </div>
              )}
            </div>
            
            {groups.length > 0 && (
              <div className="sm:ml-11 space-y-4">
                {groups.map((group, groupIndex) => {
                  if (group.type === 'code-group') {
                    const groupId = `${questionId}-group-${groupIndex}`;
                    const currentActiveTab = activeTab[groupId] || group.blocks[0].language || 'code';
                    
                    return (
                      <div key={`group-${groupIndex}`} className="relative">
                        {/* Tab Headers */}
                        <div className="flex items-center gap-2 mb-3 border-b border-gray-800 pb-2 flex-wrap">
                          {group.blocks.map((block, tabIndex) => {
                            const lang = block.language || 'code';
                            const isActive = currentActiveTab === lang;
                            
                            return (
                              <button
                                key={`tab-${tabIndex}`}
                                onClick={() => setActiveTab(prev => ({...prev, [groupId]: lang}))}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                  isActive 
                                    ? 'bg-[#6366F1] text-white' 
                                    : 'bg-[#0A0E27] text-gray-400 hover:text-white hover:bg-[#1a1f3a]'
                                }`}
                              >
                                {lang.toUpperCase()}
                                {block.label && <span className="ml-1 text-xs opacity-70">({block.label})</span>}
                              </button>
                            );
                          })}
                        </div>
                        
                        {/* Tab Content */}
                        {group.blocks.map((block, tabIndex) => {
                          const lang = block.language || 'code';
                          const isActive = currentActiveTab === lang;
                          const blockId = `${groupId}-tab-${tabIndex}`;
                          
                          if (!isActive) return null;
                          
                          return (
                            <div key={`content-${tabIndex}`} className="relative">
                              <div className="flex items-center justify-end mb-2">
                                <button
                                  onClick={() => copyCode(block.code || '', blockId)}
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
                              <div className="my-2">
                                <SyntaxHighlighter
                                  language={lang.toLowerCase()}
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
                        })}
                      </div>
                    );
                  } else {
                    // Single block (code or text)
                    const block = group.block;
                    const blockIndex = sortedBlocks.indexOf(block);
                    
                    if (block.type === 'code') {
                      const codeLanguage = block.language || 'text';
                      const blockId = `${questionId}-block-${blockIndex}`;
                      const blockKey = `${questionId}-${block.order || blockIndex}-${block.type}`;
                      
                      return (
                        <div key={blockKey} className="relative">
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
                          <div className="my-2">
                            <SyntaxHighlighter
                              language={codeLanguage.toLowerCase()}
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
                      const blockKey = `${questionId}-${block.order || blockIndex}-${block.type}`;
                      return (
                        <div key={blockKey} className="prose-custom text-white/80">
                          {parseDescriptionWithSyntaxHighlighting(block.text_content || '')}
                        </div>
                      );
                    }
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