'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { formatDisplayText } from '../../utils/textUtils';

export default function Practice() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/topics/all');
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setError('Failed to load topics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topicId: string, topicName: string) => {
    router.push(`/practice/${topicName}`);
  };

  if (loading) {
    return (
      <div className="bg-gray-50">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div 
              className="rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#C0A063] mx-auto mb-6 animate-spin"
            ></div>
            <p className="text-[#192A41] text-lg font-semibold">Loading topics...</p>
            <p className="text-gray-600 text-sm mt-2">Preparing your learning journey</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-red-50 border border-red-200 rounded-full p-4 inline-block mb-6">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#192A41] mb-3">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
            <button
              onClick={fetchTopics}
              className="bg-[#C0A063] text-white font-semibold px-8 py-3 rounded-full hover:bg-opacity-90 transition duration-300 text-lg shadow-md hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <main className="bg-white">
        {/* Hero Section */}
        <section className="bg-[#192A41] text-white mt-10">
          <div className="container mx-auto px-3 py-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Choose Your <span className="text-[#C0A063]">Practice Topic</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Select a topic to start your practice journey and enhance your skills for competitive exams.
            </p>
          </div>
        </section>

        {/* Topics Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-[#192A41] mb-3">Available Topics</h3>
              <p className="text-gray-600 text-lg">Master essential topics for competitive exams.</p>
            </div>

            {topics.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-white rounded-2xl p-12 max-w-md mx-auto shadow-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6"></div>
                  <h2 className="text-2xl font-bold text-[#192A41] mb-4">No Topics Available</h2>
                  <p className="text-gray-600">Topics will appear here once they are added.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {topics.map((topic) => (
                  <div
                    key={topic._id}
                    onClick={() => handleTopicClick(topic._id, topic.topic_name)}
                    onMouseEnter={() => setHoveredTopic(topic._id)}
                    onMouseLeave={() => setHoveredTopic(null)}
                    className="relative group cursor-pointer transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 h-full flex flex-col justify-between hover:border-[#C0A063] hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1 pr-4">
                          <h4 className="text-xl font-semibold text-[#192A41] leading-snug">
                            {formatDisplayText(topic.topic_name)}
                          </h4>
                        </div>
                        <div className={`transition-all duration-300 ${
                          hoveredTopic === topic._id 
                            ? 'transform translate-x-1 text-[#C0A063]' 
                            : 'text-gray-400'
                        }`}>
                          <ArrowRight className="h-6 w-6" />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <div className={`text-sm font-medium transition-all duration-300 ${
                          hoveredTopic === topic._id 
                            ? 'text-[#C0A063]' 
                            : 'text-gray-500'
                        }`}>
                          Start Practice
                        </div>
                      </div>

                      <div className={`absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none ${
                        hoveredTopic === topic._id 
                          ? 'bg-gradient-to-br from-[#C0A063]/5 to-transparent' 
                          : ''
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

