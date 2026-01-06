import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Code, Star } from 'lucide-react';
import { fetchFromApi } from '../../../utils/serverApi';
import QuestionClient from './QuestionClient';
import ScrollToTopButton from '../../../components/ScrollToTopButton';

// Enable ISR - revalidate every 60 seconds for better performance
export const revalidate = 60;

interface ContentBlock {
  type: 'code' | 'text';
  code?: string;
  language?: string;
  text_content?: string;
  order?: number;
  label?: string;
}

interface Question {
  _id: string;
  title: string;
  description?: string;
  difficulty?: string;
  content_blocks?: ContentBlock[];
  order?: number;
}

interface ProgrammingTopic {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  difficulty?: string;
  tags?: string[];
  featured?: boolean;
}

interface TopicDetailPageProps {
  params: Promise<{ slug: string }>;
}

async function getTopic(slug: string): Promise<{ topic: ProgrammingTopic; questions: Question[]; question_count: number } | null> {
  try {
    const data = await fetchFromApi(`/api/programming-topics/slug/${encodeURIComponent(slug)}`) as {
      topic: ProgrammingTopic;
      questions: Question[];
      question_count: number;
    };
    return data || null;
  } catch (error) {
    console.error('Error fetching programming topic:', error);
    return null;
  }
}

export default async function TopicDetail({ params }: TopicDetailPageProps) {
  const { slug } = await params;

  let data: { topic: ProgrammingTopic; questions: Question[]; question_count: number } | null = null;
  let error: string | null = null;

  try {
    data = await getTopic(slug);
    if (!data) {
      error = 'Topic not found';
    }
  } catch (err) {
    error = 'Failed to load topic';
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center p-4">
        <main className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-white mb-2">Topic Not Found</h1>
          <p className="text-gray-400 mb-6">The programming topic you're looking for doesn't exist.</p>
          <Link
            prefetch
            href="/programming-topics"
            className="inline-block bg-[#6366F1] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#5558E3] transition duration-300"
            aria-label="Back to Programming Topics"
          >
            Back to Topics
          </Link>
        </main>
      </div>
    );
  }

  const { topic, questions, question_count } = data;

  // Sort questions by order
  const sortedQuestions = questions && questions.length > 0
    ? questions.sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com';

  // JSON-LD Schema for SEO
  const topicSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: topic.title,
    description: topic.description || `Programming questions and code examples for ${topic.title}`,
    url: `${baseUrl}/programming-topics/${slug}`,
    author: {
      '@type': 'Organization',
      name: 'PariksaHub',
    },
    publisher: {
      '@type': 'Organization',
      name: 'PariksaHub',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/programming-topics/${slug}`,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${baseUrl}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Programming Topics',
          item: `${baseUrl}/programming-topics`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: topic.title,
          item: `${baseUrl}/programming-topics/${slug}`,
        },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(topicSchema) }}
      />

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
                href="/programming-topics"
                className="text-sm text-gray-400 hover:text-white flex items-center gap-2 mb-2 sm:mb-4 transition-colors"
                aria-label="Back to Programming Topics"
              >
                <ArrowLeft className="h-4 w-4 text-gray-400" aria-hidden="true" />
                Back to Topics
              </Link>
            </nav>
          </div>

          {/* Title Section */}
          <div className="border-b-4 border-[#6366F1] pb-2 mb-2">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2">
                  {topic.title}
                </h1>
                {topic.description && (
                  <p className="text-base sm:text-lg text-gray-400 leading-relaxed mb-3">
                    {topic.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {topic.featured && (
                    <span className="px-3 py-1 bg-[#6366F1] text-white rounded-full font-bold flex items-center gap-1">
                      <Star className="w-4 h-4" fill="currentColor" aria-hidden="true" />
                      Featured
                    </span>
                  )}
                  <span className="px-3 py-1 bg-[#161B33] text-white border border-gray-700 rounded-full flex items-center gap-1">
                    <Code className="w-4 h-4 text-[#6366F1]" aria-hidden="true" />
                    {question_count} {question_count === 1 ? 'question' : 'questions'}
                  </span>
                  <span className="px-3 py-1 bg-[#161B33] text-white border border-gray-700 rounded-full">
                    {topic.category}
                  </span>
                  {topic.difficulty && (
                    <span className="px-3 py-1 bg-[#161B33] text-white border border-gray-700 rounded-full">
                      {topic.difficulty}
                    </span>
                  )}
                </div>
                {topic.tags && topic.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {topic.tags.map((tag, idx) => (
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
          {sortedQuestions.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-6">
                Questions & Code Solutions
              </h2>

              {/* Table of Contents */}
              <div className="bg-[#161B33] border border-gray-800 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-[#6366F1]" aria-hidden="true" />
                  Table of Contents
                </h3>
                <nav aria-label="Table of contents">
                  <ol className="space-y-2">
                    {sortedQuestions.map((question, index) => {
                      // Strip HTML from title to prevent unwanted highlighting and decode entities
                      let plainTitle = question.title.replace(/<[^>]*>/g, '');
                      plainTitle = plainTitle
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
                              {plainTitle}
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ol>
                </nav>
              </div>

              <QuestionClient questions={sortedQuestions} />
            </div>
          ) : (
            <div className="bg-[#161B33] border border-gray-800 rounded-2xl p-8 text-center">
              <Code className="w-12 h-12 text-gray-400 mx-auto mb-3" aria-hidden="true" />
              <p className="text-gray-400">No questions available yet for this topic.</p>
            </div>
          )}

          {/* Back to Topics */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <Link
              prefetch
              href="/programming-topics"
              className="inline-flex items-center gap-2 text-[#6366F1] hover:text-[#8B5CF6] font-bold transition-colors"
              aria-label="See other programming topics"
            >
              <ArrowLeft className="h-4 w-4 text-[#6366F1]" aria-hidden="true" />
              See Other Topics
            </Link>
          </div>
        </div>
      </section>
      <ScrollToTopButton />
    </div>
  );
}

