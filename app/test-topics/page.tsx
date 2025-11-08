import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowUpRight } from 'lucide-react';
import { fetchFromApi } from '../../utils/serverApi';
import { formatDisplayText } from '../../utils/textUtils';

interface Topic {
  _id: string;
  topic_name: string;
}

async function getTopics(): Promise<Topic[]> {
  try {
    const data = await fetchFromApi('/api/topics/all') as Topic[];
    return data || [];
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw new Error('Failed to load topics. Please try again later.');
  }
}

export default async function TestTopics() {
  let topics: Topic[] = [];
  let error: string | null = null;

  try {
    topics = await getTopics();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load topics. Please try again later.';
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center p-4">
        <main className="text-center max-w-md mx-auto px-4">
          
          <h1 className="text-2xl font-bold text-white mb-2">Something Went Wrong</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            href="/test-topics"
            className="bg-[#6366F1] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#5558E3] transition duration-300 inline-block"
            aria-label="Try loading test topics again"
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
          <div className="inline-block mb-5 px-4 py-1.5 bg-[#6366F1] bg-opacity-10 backdrop-blur-sm border border-[#6366F1] border-opacity-30 rounded-full">
            <span className="text-xs font-bold text-[#ffffff] tracking-wider uppercase">Online Tests</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-5 leading-[1.1] tracking-tight">
            <span className="block">Take Online</span>
            <span className="block bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899] text-transparent bg-clip-text pb-3">Mock Tests</span>
          </h1>
          
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Practice with timed online tests and get instant results. Choose a topic to start your mock test.
          </p>
        </div>
      </section>

      {/* Topics Grid */}
      <section id="results-section" className="relative py-12 bg-gradient-to-b from-[#0A0E27] to-[#1a1f3a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-bold text-[#6366F1] mb-2 tracking-widest uppercase">Available Now</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                {topics.length} Topics Ready
              </h2>
            </div>
          </div>
          
          {topics.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-700 rounded-2xl bg-white bg-opacity-5">
              <h3 className="text-xl font-bold mb-2">No Topics Yet</h3>
              <p className="text-gray-400">Check back soon for test topics</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {topics.map((topic, index) => (
                <Link
                  key={topic._id}
                  href={`/test-topics/${topic.topic_name}`}
                  className="group relative bg-[#161B33] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col border border-gray-700 hover:border-[#6366F1] shadow-lg shadow-[#6366F1]/20 hover:shadow-2xl hover:shadow-[#6366F1]/50 min-h-[200px]"
                  aria-label={`Start online test for ${formatDisplayText(topic.topic_name)}`}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/10 via-transparent to-[#EC4899]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative p-6 flex flex-col flex-grow">
                    {/* Index Number */}
                    <div className="absolute top-4 right-4 text-5xl font-black text-white opacity-5 group-hover:opacity-10 transition-opacity">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold mb-auto line-clamp-3 leading-snug relative z-10 pr-8">
                      {formatDisplayText(topic.topic_name)}
                    </h3>

                    {/* Footer */}
                    <div className="mt-5 flex justify-between items-center relative z-10">
                      <span className="text-sm font-bold text-[#6366F1] group-hover:text-[#8B5CF6] transition-colors">
                        Start Test
                      </span>
                      <div className="w-10 h-10 bg-[#6366F1] group-hover:bg-gradient-to-br group-hover:from-[#6366F1] group-hover:to-[#8B5CF6] flex items-center justify-center transition-all duration-300 group-hover:rotate-45 rounded-lg">
                        <ArrowUpRight className="w-5 h-5 text-white transition-all duration-300" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

