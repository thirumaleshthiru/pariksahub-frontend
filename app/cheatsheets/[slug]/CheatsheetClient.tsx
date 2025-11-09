'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CheatsheetItem {
  _id?: string;
  title: string;
  description?: string;
  category?: string;
  content_type: 'code' | 'text' | 'mixed';
  code?: string;
  language?: string;
  text_content?: string;
  mixed_content?: Array<{
    type: 'code' | 'text';
    content: string;
    language?: string;
  }>;
  order?: number;
}

interface CheatsheetClientProps {
  items: CheatsheetItem[];
  itemCategories: string[];
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
  
  // C/C++ indicators
  if (codeLower.includes('#include') || codeLower.includes('int main') ||
      codeLower.includes('printf') || codeLower.includes('std::')) {
    return 'cpp';
  }
  
  // Default to text if can't detect
  return 'text';
}

export default function CheatsheetClient({ items, itemCategories }: CheatsheetClientProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    // Smooth scroll to the items section after a brief delay to allow state update
    setTimeout(() => {
      const itemsSection = document.getElementById('cheatsheet-items');
      if (itemsSection) {
        itemsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const renderItemContent = (item: CheatsheetItem, itemId: string) => {
    switch (item.content_type) {
      case 'code':
        const codeLanguage = detectLanguage(item.code || '', item.language);
        return (
          <div className="relative">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-800">
              <span className="text-xs font-mono text-gray-400 uppercase">{codeLanguage}</span>
              <button
                onClick={() => copyCode(item.code || '', itemId)}
                className="text-xs sm:text-xs text-white hover:text-[#6366F1] flex items-center gap-1 cursor-pointer transition-colors"
                aria-label={copied === itemId ? 'Code copied to clipboard' : 'Copy code to clipboard'}
              >
                {copied === itemId ? <Check className="h-4 w-4 text-[#6366F1]" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                <span className="font-bold">{copied === itemId ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="my-4">
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
                {item.code || ''}
              </SyntaxHighlighter>
            </div>
          </div>
        );

      case 'text':
        return (
          <div 
            className="prose-custom quill-content text-white/80"
            dangerouslySetInnerHTML={{ __html: item.text_content || '' }}
          />
        );

      case 'mixed':
        return (
          <div className="space-y-4">
            {item.mixed_content && item.mixed_content.map((block, blockIndex) => {
              if (block.type === 'code') {
                const blockLanguage = detectLanguage(block.content || '', block.language);
                return (
                  <div key={blockIndex} className="relative">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-800">
                      <span className="text-xs font-mono text-gray-400 uppercase">{blockLanguage}</span>
                      <button
                        onClick={() => copyCode(block.content || '', `${itemId}-${blockIndex}`)}
                        className="text-xs sm:text-xs text-white hover:text-[#6366F1] flex items-center gap-1 cursor-pointer transition-colors"
                        aria-label={copied === `${itemId}-${blockIndex}` ? 'Code copied to clipboard' : 'Copy code to clipboard'}
                      >
                        {copied === `${itemId}-${blockIndex}` ? <Check className="h-4 w-4 text-[#6366F1]" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                        <span className="font-bold">{copied === `${itemId}-${blockIndex}` ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="my-4">
                      <SyntaxHighlighter
                        language={blockLanguage}
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
                        {block.content || ''}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                );
              }
              return (
                <div key={blockIndex}>
                  <div 
                    className="prose-custom quill-content text-white/80"
                    dangerouslySetInnerHTML={{ __html: block.content }}
                  />
                </div>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Category Filter */}
      {itemCategories.length > 1 && (
        <div className="no-print mb-1 sm:mb-2 pb-1 sm:pb-2 border-b border-gray-800 print:hidden">
          <div className="flex flex-wrap gap-2">
            {itemCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
                  selectedCategory === cat
                    ? 'bg-[#6366F1] text-white'
                    : 'bg-[#161B33] text-gray-400 border border-gray-800 hover:border-[#6366F1] hover:text-white'
                }`}
                aria-label={`Filter by ${cat === 'all' ? 'all categories' : cat} category`}
                aria-pressed={selectedCategory === cat ? 'true' : 'false'}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table of Contents */}
      {filteredItems.length > 3 && (
        <div className="mb-2 sm:mb-4 p-3 sm:p-4 lg:p-6 bg-[#161B33] border border-gray-800 rounded-xl">
          <h2 className="text-base sm:text-lg font-bold text-white mb-3">Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredItems.map((item, index) => (
              <a
                key={index}
                href={`#item-${index}`}
                className="text-xs sm:text-sm text-white/90 hover:text-[#6366F1] underline transition-colors"
                aria-label={`Jump to ${item.title}`}
              >
                {index + 1}. {item.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div id="cheatsheet-items" className="space-y-4 sm:space-y-6">
        {filteredItems.map((item, index) => (
          <div 
            key={index} 
            id={`item-${index}`}
            className="scroll-mt-20"
          >
            <div className="mb-4 flex items-start gap-3 sm:gap-4">
              <span className="text-2xl sm:text-3xl font-bold text-white leading-none pt-1">
                {index + 1}
              </span>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {item.title}
                </h2>
                {item.description && (
                  <p className="text-gray-400 text-xs sm:text-sm">{item.description}</p>
                )}
                {item.category && selectedCategory === 'all' && (
                  <span className="inline-block mt-2 text-xs px-2 py-1 bg-[#161B33] text-white border border-gray-700 rounded">
                    {item.category}
                  </span>
                )}
              </div>
            </div>
            
            <div className="pl-4 border-l-2 border-[#6366F1]">
              {renderItemContent(item, `item-${index}`)}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No items found for the selected category.</p>
        </div>
      )}
    </>
  );
}

