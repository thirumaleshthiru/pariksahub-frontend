'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';

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

interface Cheatsheet {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  tags?: string[];
  color?: string;
  featured?: boolean;
  views?: number;
  items?: CheatsheetItem[];
  createdAt?: string;
  updatedAt?: string;
}

function CheatsheetDetail() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [cheatsheet, setCheatsheet] = useState<Cheatsheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (slug) {
      fetchCheatsheet();
    }
  }, [slug]);

  const fetchCheatsheet = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/cheatsheets/slug/${slug}`);
      setCheatsheet(response.data);
      setError('');
    } catch (error) {
      setError('Cheatsheet not found');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div 
            className="rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#C0A063] mx-auto mb-6 animate-spin"
          ></div>
          <p className="text-[#192A41] text-lg font-semibold">Loading cheatsheet...</p>
          <p className="text-gray-600 text-sm mt-2">Preparing your learning journey</p>
        </div>
      </div>
    );
  }

  if (error || !cheatsheet) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-full p-4 inline-block mb-6">
            <h2 className="text-2xl font-bold text-[#192A41] mb-3">Cheatsheet Not Found</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">The cheatsheet you're looking for doesn't exist.</p>
            <Link
              href="/cheatsheets"
              className="inline-block bg-[#C0A063] text-white font-semibold px-8 py-3 rounded-full hover:bg-opacity-90 transition duration-300 text-lg shadow-md hover:shadow-xl"
            >
              Back to Cheatsheets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const items = cheatsheet.items && cheatsheet.items.length > 0 
    ? cheatsheet.items.sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const itemCategories = items.length > 0 
    ? ['all', ...new Set(items.map(item => item.category).filter(Boolean) as string[])]
    : ['all'];

  const renderItemContent = (item: CheatsheetItem, itemId: string) => {
    switch (item.content_type) {
      case 'code':
        return (
          <div className="relative">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
              <span className="text-xs font-mono text-gray-500 uppercase">{item.language || 'code'}</span>
              <button
                onClick={() => copyCode(item.code || '', itemId)}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copied === itemId ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied === itemId ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="bg-gray-50 p-4 rounded border border-gray-200 overflow-x-auto text-sm font-mono leading-relaxed">
              <code className="text-gray-800">{item.code}</code>
            </pre>
          </div>
        );

      case 'text':
        return (
          <div 
            className="prose-custom quill-content"
            dangerouslySetInnerHTML={{ __html: item.text_content || '' }}
          />
        );

      case 'mixed':
        return (
          <div className="space-y-4">
            {item.mixed_content && item.mixed_content.map((block, blockIndex) => (
              <div key={blockIndex}>
                {block.type === 'code' ? (
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
                      <span className="text-xs font-mono text-gray-500 uppercase">{block.language || 'code'}</span>
                      <button
                        onClick={() => copyCode(block.content || '', `${itemId}-${blockIndex}`)}
                        className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copied === `${itemId}-${blockIndex}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copied === `${itemId}-${blockIndex}` ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="bg-gray-50 p-4 rounded border border-gray-200 overflow-x-auto text-sm font-mono leading-relaxed">
                      <code className="text-gray-800">{block.content}</code>
                    </pre>
                  </div>
                ) : (
                  <div 
                    className="prose-custom quill-content"
                    dangerouslySetInnerHTML={{ __html: block.content }}
                  />
                )}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8 mt-16 print:[&_.no-print]:hidden [&_.prose-custom]:leading-[1.7] [&_.prose-custom]:text-gray-900 [&_.prose-custom_h1]:text-2xl [&_.prose-custom_h1]:font-bold [&_.prose-custom_h1]:my-6 [&_.prose-custom_h1]:mt-6 [&_.prose-custom_h1]:mb-3 [&_.prose-custom_h1]:text-gray-900 [&_.prose-custom_h2]:text-xl [&_.prose-custom_h2]:font-bold [&_.prose-custom_h2]:my-5 [&_.prose-custom_h2]:mt-5 [&_.prose-custom_h2]:mb-2 [&_.prose-custom_h2]:text-gray-900 [&_.prose-custom_h3]:text-lg [&_.prose-custom_h3]:font-semibold [&_.prose-custom_h3]:my-4 [&_.prose-custom_h3]:mt-4 [&_.prose-custom_h3]:mb-2 [&_.prose-custom_h3]:text-gray-900 [&_.prose-custom_p]:my-3 [&_.prose-custom_p]:text-gray-900 [&_.prose-custom_p]:bg-yellow-100 [&_.prose-custom_p]:py-2 [&_.prose-custom_p]:px-3 [&_.prose-custom_p]:rounded [&_.prose-custom_p]:border-l-2 [&_.prose-custom_p]:border-amber-500 [&_.prose-custom_code]:bg-gray-100 [&_.prose-custom_code]:px-1.5 [&_.prose-custom_code]:py-0.5 [&_.prose-custom_code]:rounded [&_.prose-custom_code]:font-mono [&_.prose-custom_code]:text-sm [&_.prose-custom_code]:text-red-500 [&_.prose-custom_pre]:bg-gray-50 [&_.prose-custom_pre]:border [&_.prose-custom_pre]:border-gray-200 [&_.prose-custom_pre]:p-4 [&_.prose-custom_pre]:rounded-md [&_.prose-custom_pre]:overflow-x-auto [&_.prose-custom_pre]:my-4 [&_.prose-custom_pre_code]:bg-transparent [&_.prose-custom_pre_code]:text-gray-900 [&_.prose-custom_pre_code]:p-0 [&_.prose-custom_ul]:my-3 [&_.prose-custom_ul]:pl-6 [&_.prose-custom_ul]:text-gray-900 [&_.prose-custom_ol]:my-3 [&_.prose-custom_ol]:pl-6 [&_.prose-custom_ol]:text-gray-900 [&_.prose-custom_li]:my-1.5 [&_.prose-custom_li]:text-gray-900 [&_.prose-custom_a]:text-blue-600 [&_.prose-custom_a]:underline [&_.prose-custom_strong]:font-semibold [&_.prose-custom_strong]:text-gray-900 [&_.prose-custom_div]:text-gray-900 [&_.prose-custom_span]:text-gray-900">
        {/* Header */}
        <div className="no-print mb-6 print:hidden">
          <Link
            href="/cheatsheets"
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        {/* Title Section */}
        <div className="border-b-4 border-gray-900 pb-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {cheatsheet.title}
              </h1>
              {cheatsheet.description && (
                <p className="text-gray-600 text-lg mt-3 leading-relaxed">
                  {cheatsheet.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span className="px-3 py-1 bg-gray-100 rounded">
                  {cheatsheet.category}
                </span>
                {cheatsheet.views && cheatsheet.views > 0 && (
                  <span>{cheatsheet.views} views</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        {itemCategories.length > 1 && (
          <div className="no-print mb-8 pb-6 border-b border-gray-200 print:hidden">
            <div className="flex flex-wrap gap-2">
              {itemCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-sm font-medium rounded transition ${
                    selectedCategory === cat
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Table of Contents */}
        {filteredItems.length > 3 && (
          <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredItems.map((item, index) => (
                <a
                  key={index}
                  href={`#item-${index}`}
                  className="text-sm text-gray-700 hover:text-gray-900 underline transition-colors"
                >
                  {index + 1}. {item.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="space-y-10">
          {filteredItems.map((item, index) => (
            <div 
              key={index} 
              id={`item-${index}`}
              className="scroll-mt-20"
            >
              <div className="mb-4 flex items-start gap-4">
                <span className="text-3xl font-bold text-gray-300 leading-none pt-1">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {item.title}
                  </h2>
                  {item.description && (
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  )}
                  {item.category && selectedCategory === 'all' && (
                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {item.category}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="pl-4 border-l-2 border-gray-300">
                {renderItemContent(item, `item-${index}`)}
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found for the selected category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheatsheetDetail;

