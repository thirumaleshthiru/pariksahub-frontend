import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, BookOpen } from 'lucide-react';
import { fetchFromApi } from '../../../utils/serverApi';
import { formatDisplayText } from '../../../utils/textUtils';
import TestSubtopicCard from './TestSubtopicCard';

interface Subtopic {
  _id: string;
  subtopic_name: string;
}

interface TestSubTopicsPageProps {
  params: Promise<{ topicName: string }>;
}

async function getSubtopics(topicName: string): Promise<Subtopic[]> {
  try {
    const data = await fetchFromApi(`/api/subtopics/topicname/${encodeURIComponent(topicName)}`) as Subtopic[];
    return data || [];
  } catch (error) {
    console.error('Error fetching subtopics:', error);
    throw new Error('Failed to load subtopics. Please try again later.');
  }
}

export default async function TestSubTopics({ params }: TestSubTopicsPageProps) {
  const { topicName } = await params;
  let subtopics: Subtopic[] = [];
  let error: string | null = null;

  try {
    subtopics = await getSubtopics(topicName);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load subtopics. Please try again later.';
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center p-4">
        <main className="text-center max-w-md mx-auto px-4">
         
          <h1 className="text-2xl font-bold text-white mb-2">Something Went Wrong</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            href={`/test-topics/${topicName}`}
            className="bg-[#6366F1] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#5558E3] transition duration-300 inline-block"
            aria-label="Try loading subtopics again"
          >
            Try Again
          </Link>
        </main>
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
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-gray-400" aria-label="Breadcrumb navigation">
            <Link href="/test-topics" className="hover:text-white transition-colors" aria-label="Go to test topics">Test Topics</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-[#6366F1] font-medium">{formatDisplayText(topicName)}</span>
          </nav>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-5 leading-[1.1] tracking-tight">
            <span>{formatDisplayText(topicName)} <span className="block bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899] text-transparent bg-clip-text pb-3">Mock Tests</span></span>
          </h1>
          
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Choose a specific subtopic to start your timed online test. Select from the available subtopics below.
          </p>
        </div>
      </section>

      {/* Subtopics Section */}
      <section id="results-section" className="relative py-12 bg-gradient-to-b from-[#0A0E27] to-[#1a1f3a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-bold text-[#6366F1] mb-2 tracking-widest uppercase">Available Now</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                {subtopics.length} {subtopics.length === 1 ? 'Subtopic' : 'Subtopics'} Ready
              </h2>
            </div>
          </div>
          
          {subtopics.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-700 rounded-2xl bg-white bg-opacity-5">
              <div className="w-16 h-16 rounded-xl bg-[#161B33] border border-gray-800 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-gray-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">No Subtopics Available</h3>
              <p className="text-sm text-gray-400">Subtopics will appear here once they are added for this topic.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subtopics.map((subtopic, index) => (
                <TestSubtopicCard key={subtopic._id} subtopic={subtopic} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

