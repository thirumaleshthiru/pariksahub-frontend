import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { fetchFromApi } from '../../../utils/serverApi';
import CheatsheetClient from './CheatsheetClient';

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

interface CheatsheetDetailPageProps {
  params: Promise<{ slug: string }>;
}

async function getCheatsheet(slug: string): Promise<Cheatsheet | null> {
  try {
    const data = await fetchFromApi(`/api/cheatsheets/slug/${encodeURIComponent(slug)}`) as Cheatsheet;
    return data || null;
  } catch (error) {
    console.error('Error fetching cheatsheet:', error);
    return null;
  }
}

export default async function CheatsheetDetail({ params }: CheatsheetDetailPageProps) {
  const { slug } = await params;
  
  let cheatsheet: Cheatsheet | null = null;
  let error: string | null = null;

  try {
    cheatsheet = await getCheatsheet(slug);
    if (!cheatsheet) {
      error = 'Cheatsheet not found';
    }
  } catch (err) {
    error = 'Failed to load cheatsheet';
  }

  if (error || !cheatsheet) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center p-4">
        <main className="text-center max-w-md mx-auto px-4">
          <div className="border border-red-500 rounded-2xl p-4 inline-block mb-4">
            <h1 className="text-2xl font-bold text-white mb-2">Cheatsheet Not Found</h1>
            <p className="text-gray-400 mb-6">The cheatsheet you're looking for doesn't exist.</p>
            <Link
              href="/cheatsheets"
              className="inline-block bg-[#6366F1] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#5558E3] transition duration-300"
              aria-label="Go back to cheatsheets list"
            >
              Back to Cheatsheets
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const items = cheatsheet.items && cheatsheet.items.length > 0 
    ? cheatsheet.items.sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  const itemCategories = items.length > 0 
    ? ['all', ...new Set(items.map(item => item.category).filter(Boolean) as string[])]
    : ['all'];

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-6 sm:pb-10 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99, 102, 241) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
        
        {/* Gradient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-[#6366F1] to-transparent rounded-full blur-[100px] opacity-20"></div>
        
        <div className="relative max-w-6xl mx-auto px-6 z-10">
          {/* Header */}
          <div className="no-print mb-3 sm:mb-6 print:hidden">
            <Link
              href="/cheatsheets"
              className="text-sm text-gray-400 hover:text-white flex items-center gap-2 mb-2 sm:mb-4 transition-colors"
              aria-label="Back to cheatsheets list"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
          </div>

          {/* Title Section */}
          <div className="border-b-4 border-[#6366F1] pb-1 sm:pb-2 mb-1 sm:mb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-1 sm:mb-2">
                  {cheatsheet.title}
                </h1>
                {cheatsheet.description && (
                  <p className="text-gray-400 text-base sm:text-lg mt-2 sm:mt-3 leading-relaxed">
                    {cheatsheet.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 sm:mt-4 text-sm">
                  <span className="px-3 py-1 bg-[#161B33] text-white border border-gray-700 rounded">
                    {cheatsheet.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative pt-1 sm:pt-2 pb-4 sm:pb-6 bg-gradient-to-b from-[#0A0E27] to-[#1a1f3a]">
        <div className="max-w-4xl mx-auto px-6 print:[&_.no-print]:hidden [&_.prose-custom]:leading-[1.7] [&_.prose-custom]:text-white/80 [&_.prose-custom_h1]:text-2xl [&_.prose-custom_h1]:font-bold [&_.prose-custom_h1]:my-6 [&_.prose-custom_h1]:mt-6 [&_.prose-custom_h1]:mb-3 [&_.prose-custom_h1]:text-white/80 [&_.prose-custom_h2]:text-xl [&_.prose-custom_h2]:font-bold [&_.prose-custom_h2]:my-5 [&_.prose-custom_h2]:mt-5 [&_.prose-custom_h2]:mb-2 [&_.prose-custom_h2]:text-white/80 [&_.prose-custom_h3]:text-lg [&_.prose-custom_h3]:font-semibold [&_.prose-custom_h3]:my-4 [&_.prose-custom_h3]:mt-4 [&_.prose-custom_h3]:mb-2 [&_.prose-custom_h3]:text-white/80 [&_.prose-custom_p]:my-3 [&_.prose-custom_p]:text-white/80 [&_.prose-custom_p]:bg-[#161B33] [&_.prose-custom_p]:py-2 [&_.prose-custom_p]:px-3 [&_.prose-custom_p]:rounded [&_.prose-custom_p]:border-l-2 [&_.prose-custom_p]:border-[#6366F1] [&_.prose-custom_code]:bg-[#161B33] [&_.prose-custom_code]:px-1.5 [&_.prose-custom_code]:py-0.5 [&_.prose-custom_code]:rounded [&_.prose-custom_code]:font-mono [&_.prose-custom_code]:text-sm [&_.prose-custom_code]:text-[#EC4899] [&_.prose-custom_pre]:bg-[#161B33] [&_.prose-custom_pre]:border [&_.prose-custom_pre]:border-gray-800 [&_.prose-custom_pre]:p-4 [&_.prose-custom_pre]:rounded-md [&_.prose-custom_pre]:overflow-x-auto [&_.prose-custom_pre]:my-4 [&_.prose-custom_pre_code]:bg-transparent [&_.prose-custom_pre_code]:text-white/80 [&_.prose-custom_pre_code]:p-0 [&_.prose-custom_ul]:my-3 [&_.prose-custom_ul]:pl-6 [&_.prose-custom_ul]:text-white/80 [&_.prose-custom_ol]:my-3 [&_.prose-custom_ol]:pl-6 [&_.prose-custom_ol]:text-white/80 [&_.prose-custom_li]:my-1.5 [&_.prose-custom_li]:text-white/80 [&_.prose-custom_a]:text-[#6366F1] [&_.prose-custom_a]:underline [&_.prose-custom_strong]:font-semibold [&_.prose-custom_strong]:text-white/80 [&_.prose-custom_div]:text-white/80 [&_.prose-custom_span]:text-white/80">
          <CheatsheetClient items={items} itemCategories={itemCategories} />
        </div>
      </section>
    </div>
  );
}

