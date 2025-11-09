import React from 'react';
import Link from 'next/link';
import { fetchFromApi } from '../../../../utils/serverApi';
import { formatDisplayText } from '../../../../utils/textUtils';
import FloatingNotes from '../../../../components/FloatingNotes';
import QuestionsClient from './QuestionsClient';
 

interface Question {
  _id: string;
  question: string;
  answer: string;
  explanation?: string;
  question_image_url?: string;
}

interface Option {
  _id: string;
  option_text: string;
  option_type: string;
  path_url?: string;
}

interface QuestionItem {
  question: Question;
  options: Option[];
}

interface SubTopicQuestionsPageProps {
  params: Promise<{ topicName: string; subTopicName: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function getQuestions(subTopicName: string): Promise<QuestionItem[]> {
  try {
    const data = await fetchFromApi(`/api/questions/subtopic/${encodeURIComponent(subTopicName)}`) as QuestionItem[];
    return data || [];
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw new Error('Failed to load questions. Please try again later.');
  }
}

export default async function SubTopicQuestions({ params, searchParams }: SubTopicQuestionsPageProps) {
  const { topicName, subTopicName } = await params;
  const { page } = await searchParams;
  const currentPage = parseInt(page || '1', 10);
  const questionsPerPage = 10;
  
  let questions: QuestionItem[] = [];
  let error: string | null = null;

  try {
    questions = await getQuestions(subTopicName);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load questions. Please try again later.';
  }

  const displayTopicName = formatDisplayText(topicName);
  const displaySubTopicName = formatDisplayText(subTopicName);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center p-4">
        <main className="text-center max-w-md mx-auto px-4">
          
          <h1 className="text-2xl font-bold text-white mb-2">Something Went Wrong</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            href={`/practice/${topicName}/${subTopicName}`}
            className="bg-[#6366F1] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#5558E3] transition duration-300 inline-block"
            aria-label="Try loading questions again"
          >
            Try Again
          </Link>
        </main>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0E27] text-white">
        {/* Hero Section */}
        <section className="relative pt-20 pb-10 overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99, 102, 241) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
          
          {/* Gradient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-[#6366F1] to-transparent rounded-full blur-[100px] opacity-20"></div>
          
          <div className="relative max-w-6xl mx-auto px-6 text-center z-10">
            <div className="hidden md:block">
              <FloatingNotes />
            </div>
            
            <nav className="mb-6 text-sm text-gray-400" aria-label="Breadcrumb navigation">
              <Link href="/practice" className="hover:text-white transition-colors" aria-label="Go to practice topics">Practice</Link>
              <span className="mx-2" aria-hidden="true">/</span>
              <Link href={`/practice/${topicName}`} className="hover:text-white transition-colors" aria-label={`Go to ${displayTopicName} topic`}>
                {displayTopicName}
              </Link>
              <span className="mx-2" aria-hidden="true">/</span>
              <span className="text-[#6366F1] font-medium">{displaySubTopicName}</span>
            </nav>
            
            <div className="inline-block mb-5 px-4 py-1.5 bg-[#6366F1] bg-opacity-10 backdrop-blur-sm border border-[#6366F1] border-opacity-30 rounded-full">
              <span className="text-xs font-bold text-[#ffffff] tracking-wider uppercase">Practice Questions</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-5 leading-[1.1] tracking-tight">
              <span className="block">{displaySubTopicName}</span>
              <span className="block bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899] text-transparent bg-clip-text pb-3">Practice Questions</span>
            </h1>
            
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-8">
              Improve your understanding of {displaySubTopicName} with comprehensive practice questions, clear explanations, and AI-powered guidance from {displayTopicName} Topic.
            </p>
          </div>
        </section>

        {/* Empty State Section */}
        <section className="relative py-12 bg-gradient-to-b from-[#0A0E27] to-[#1a1f3a]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center py-20 border-2 border-dashed border-gray-700 rounded-2xl bg-white bg-opacity-5">
              <div className="w-16 h-16 rounded-xl bg-[#161B33] border border-gray-800 mx-auto mb-4" aria-hidden="true"></div>
              <h2 className="text-xl font-bold mb-2">No Questions Yet</h2>
              <p className="text-gray-400">Check back soon for practice materials</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-10 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99, 102, 241) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
        
        {/* Gradient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-[#6366F1] to-transparent rounded-full blur-[100px] opacity-20"></div>
        
        <div className="relative max-w-6xl mx-auto px-6 text-center z-10">
          <div className="hidden md:block">
            <FloatingNotes />
          </div>
          
          <nav className="mb-6 text-sm text-gray-400" aria-label="Breadcrumb navigation">
            <Link href="/practice" className="hover:text-white transition-colors" aria-label="Go to practice topics">Practice</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <Link href={`/practice/${topicName}`} className="hover:text-white transition-colors" aria-label={`Go to ${displayTopicName} topic`}>
              {displayTopicName}
            </Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-[#6366F1] font-medium">{displaySubTopicName}</span>
          </nav>
          
      
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-2 leading-[1.1] tracking-tight">
            <span className="block">{displaySubTopicName}</span>
            <span className="block bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899] text-transparent bg-clip-text pb-3">Practice Questions</span>
          </h1>
          
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-0">
            Improve your understanding of {displaySubTopicName} with comprehensive practice questions, clear explanations, and AI-powered guidance from {displayTopicName} Topic.
          </p>
        </div>
      </section>

      {/* Questions Section */}
      <section className="relative py-12 bg-gradient-to-b from-[#0A0E27] to-[#1a1f3a]">
        <div className="max-w-6xl mx-auto px-6">
          <QuestionsClient 
            questions={questions} 
            apiUrl={API_URL} 
            topicName={topicName}
            subTopicName={subTopicName}
            currentPage={currentPage}
            questionsPerPage={questionsPerPage}
          />
        </div>
      </section>
    </div>
  );
}

