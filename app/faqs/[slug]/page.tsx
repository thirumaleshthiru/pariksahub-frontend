import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { fetchFromApi } from '../../../utils/serverApi';
import FAQClient from './FAQClient';
import ScrollToTopButton from '../../../components/ScrollToTopButton';

// Enable ISR - revalidate every 60 seconds for better performance
export const revalidate = 60;

interface Question {
  _id?: string;
  question: string;
  answer: string;
  order?: number;
}

interface FAQ {
  _id: string;
  topic_title: string;
  slug: string;
  description?: string;
  tags?: string[];
  featured?: boolean;
  views?: number;
  questions: Question[];
  createdAt?: string;
  updatedAt?: string;
  logo_url?: string;
}

interface FAQDetailPageProps {
  params: Promise<{ slug: string }>;
}

async function getFAQ(slug: string): Promise<FAQ | null> {
  try {
    const data = await fetchFromApi(`/api/faqs/slug/${encodeURIComponent(slug)}`) as FAQ;
    return data || null;
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return null;
  }
}

export default async function FAQDetail({ params }: FAQDetailPageProps) {
  const { slug } = await params;

  let faq: FAQ | null = null;
  let error: string | null = null;

  try {
    faq = await getFAQ(slug);
    if (!faq) {
      error = 'FAQ not found';
    }
  } catch (err) {
    error = 'Failed to load FAQ';
  }

  if (error || !faq) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center p-4">
        <main className="text-center max-w-md mx-auto px-4">

          <h1 className="text-2xl font-bold text-white mb-2">FAQ Not Found</h1>
          <p className="text-gray-400 mb-6">The FAQ you're looking for doesn't exist.</p>
          <Link
            prefetch
            href="/faqs"
            className="inline-block bg-[#6366F1] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#5558E3] transition duration-300"
            aria-label="Back to FAQs"
          >
            Back to FAQs
          </Link>
        </main>
      </div>
    );
  }

  // Sort questions by order
  const questions = faq.questions && faq.questions.length > 0
    ? faq.questions.sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

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

        <div className="relative max-w-4xl mx-auto px-6 z-10">
          {/* Header */}
          <div className="mb-3 sm:mb-6">
            <nav aria-label="Breadcrumb navigation">
              <Link
                prefetch
                href="/faqs"
                className="text-sm text-gray-400 hover:text-white flex items-center gap-2 mb-2 sm:mb-4 transition-colors"
                aria-label="Back to FAQs"
              >
                <ArrowLeft className="h-4 w-4 text-gray-400" aria-hidden="true" />
                Back to FAQs
              </Link>
            </nav>
          </div>

          {/* Title Section */}
          <div className="border-b-4 border-[#6366F1] pb-2 mb-2">
            <div className="flex items-start gap-4">
              {/* Logo */}
              {faq.logo_url && (
                <div className="flex-shrink-0">
                  <Image
                    src={faq.logo_url}
                    alt={faq.topic_title}
                    width={80}
                    height={80}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-[#6366F1]"
                  />
                </div>
              )}

              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2">
                  {faq.topic_title}
                </h1>
                {faq.description && (
                  <p className="text-base sm:text-lg text-gray-400 leading-relaxed mb-3">
                    {faq.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {faq.featured && (
                    <span className="px-3 py-1 bg-[#6366F1] text-white rounded-full font-bold">
                      Featured
                    </span>
                  )}
                  {questions.length > 0 && (
                    <span className="px-3 py-1 bg-[#161B33] text-white border border-gray-700 rounded-full">
                      {questions.length} {questions.length === 1 ? 'question' : 'questions'}
                    </span>
                  )}
                </div>
                {faq.tags && faq.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {faq.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-md font-semibold bg-[#0A0E27] text-white border border-gray-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative pt-2 pb-6 bg-gradient-to-b from-[#0A0E27] to-[#1a1f3a]">
        <div className="max-w-4xl mx-auto px-6">
          {/* Questions */}
          {questions.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-6">
                Questions & Answers
              </h2>

              {/* Table of Contents */}
              <div className="bg-[#161B33] border border-gray-800 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#6366F1]" aria-hidden="true" />
                  Table of Contents
                </h3>
                <nav aria-label="Table of contents">
                  <ol className="space-y-2">
                    {questions.map((question, index) => {
                      // Strip HTML from question to prevent unwanted highlighting and decode entities
                      let plainQuestion = question.question.replace(/<[^>]*>/g, '');
                      plainQuestion = plainQuestion
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&amp;/g, '&')
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'")
                        .replace(/&nbsp;/g, ' ');

                      return (
                        <li key={question._id || index}>
                          <a
                            href={`#question-${index}`}
                            className="flex items-start gap-2 sm:gap-3 text-gray-300 hover:text-white transition-colors group"
                          >
                            <span className="text-sm font-bold text-[#6366F1] flex-shrink-0 mt-0.5">
                              {index + 1}.
                            </span>
                            <span className="flex-1 group-hover:text-[#6366F1] transition-colors leading-relaxed">
                              {plainQuestion}
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ol>
                </nav>
              </div>

              <FAQClient questions={questions} />
            </div>
          ) : (
            <div className="bg-[#161B33] border border-gray-800 rounded-2xl p-8 text-center">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" aria-hidden="true" />
              <p className="text-gray-400">No questions available yet.</p>
            </div>
          )}

          {/* Back to FAQs */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <Link
              prefetch
              href="/faqs"
              className="inline-flex items-center gap-2 text-[#6366F1] hover:text-[#8B5CF6] font-bold transition-colors"
              aria-label="See other FAQs"
            >
              <ArrowLeft className="h-4 w-4 text-[#6366F1]" aria-hidden="true" />
              See Other FAQs
            </Link>
          </div>
        </div>
      </section>
      <ScrollToTopButton />
    </div>
  );
}

