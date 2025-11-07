'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, ArrowRight } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { formatDisplayText } from '../../utils/textUtils';

interface Subtopic {
  _id: string;
  subtopic_name: string;
  topic_id: {
    topic_name: string;
  };
}

function RandomTopics() {
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCount, setSelectedCount] = useState(5);
  const [hoveredSubtopic, setHoveredSubtopic] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchRandomSubtopics();
  }, [selectedCount]);

  const fetchRandomSubtopics = async () => {
    setLoading(true);
    setDataLoaded(false);
    setSubtopics([]);
    try {
      const response = await axiosInstance.get('/api/subtopics/all');
      const allSubtopics = response.data;
      
      // Shuffle array and take requested number or maximum available
      const shuffled = [...allSubtopics].sort(() => Math.random() - 0.5);
      const count = Math.min(selectedCount, allSubtopics.length);
      const randomSubtopics = shuffled.slice(0, count);
      
      setSubtopics(randomSubtopics);
      setDataLoaded(true);
    } catch (error) {
      console.error('Error fetching subtopics:', error);
      setError('Failed to load subtopics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubtopicClick = (subtopic: Subtopic) => {
    router.push(`/practice/${subtopic.topic_id.topic_name}/${subtopic.subtopic_name}`);
  };

  const handleRefresh = () => {
    fetchRandomSubtopics();
  };

  const handleCountChange = (count: number) => {
    setSelectedCount(count);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div 
            className="rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#C0A063] mx-auto mb-6 animate-spin"
          ></div>
          <p className="text-[#192A41] text-lg font-semibold">Loading random topics...</p>
          <p className="text-gray-600 text-sm mt-2">Preparing your learning journey</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-full p-4 inline-block mb-6">
            <RefreshCw className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#192A41] mb-3">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
          <button
            onClick={fetchRandomSubtopics}
            className="bg-[#C0A063] text-white font-semibold px-8 py-3 rounded-full hover:bg-opacity-90 transition duration-300 text-lg shadow-md hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="bg-white">
        {/* Hero Section */}
        <section className="bg-[#192A41] text-white mt-10">
          <div className="container mx-auto px-6 py-8 md:py-16 text-center">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 md:mb-6">
              Random <span className="text-[#C0A063]">Practice</span>
            </h1>
            <p className="text-sm md:text-lg text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto">
              Discover random topics from all subjects and practice diverse questions across multiple areas for comprehensive exam preparation.
            </p>
            
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-4 md:mb-8">
              <div className="flex items-center gap-2 md:gap-3">
                <label className="text-white text-sm md:font-medium">Show:</label>
                <select
                  value={selectedCount}
                  onChange={(e) => handleCountChange(parseInt(e.target.value))}
                  className="bg-white/10 backdrop-blur-sm border border-gray-500 rounded-lg px-3 py-1 md:px-4 md:py-2 text-white text-sm focus:outline-none focus:border-[#C0A063]"
                >
                  <option value={3} className="text-gray-800">3 Topics</option>
                  <option value={5} className="text-gray-800">5 Topics</option>
                  <option value={7} className="text-gray-800">7 Topics</option>
                  <option value={10} className="text-gray-800">10 Topics</option>
                </select>
              </div>
              
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1 md:gap-2 bg-[#C0A063] text-white px-4 py-1 md:px-6 md:py-2 rounded-lg hover:bg-opacity-90 transition duration-300 text-sm md:font-medium"
              >
                <RefreshCw className="h-3 w-3 md:h-4 md:w-4" />
                Refresh
              </button>
            </div>
            
            <p className="text-xs md:text-sm text-gray-400">
              {dataLoaded ? `Showing ${subtopics.length} random topic${subtopics.length !== 1 ? 's' : ''}` : 'Preparing random topics...'}
            </p>
          </div>
        </section>

        {/* Topics Section */}
        <section className="py-12 md:py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            {!dataLoaded ? (
              <div className="text-center py-20">
                <div className="bg-white rounded-2xl p-12 max-w-md mx-auto shadow-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6"></div>
                  <h2 className="text-2xl font-bold text-[#192A41] mb-4">Loading Topics</h2>
                  <p className="text-gray-600">Please wait while we prepare your random topics...</p>
                </div>
              </div>
            ) : subtopics.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-white rounded-2xl p-12 max-w-md mx-auto shadow-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6"></div>
                  <h2 className="text-2xl font-bold text-[#192A41] mb-4">No Topics Available</h2>
                  <p className="text-gray-600">Topics will appear here once they are added to the system.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {subtopics.map((subtopic, index) => (
                  <div
                    key={subtopic._id}
                    onClick={() => handleSubtopicClick(subtopic)}
                    onMouseEnter={() => setHoveredSubtopic(subtopic._id)}
                    onMouseLeave={() => setHoveredSubtopic(null)}
                    className="relative group cursor-pointer transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 h-full flex flex-col justify-between hover:border-[#C0A063] hover:shadow-xl transition-all duration-300">
                      {/* Topic Number and Name */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3 flex-1 pr-4">
                          <div className={`w-8 h-8 bg-[#C0A063] text-white rounded-full flex items-center justify-center text-sm font-bold transition-transform duration-300 ${
                            hoveredSubtopic === subtopic._id ? 'scale-110' : ''
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-medium text-[#192A41] leading-snug">
                              {formatDisplayText(subtopic.subtopic_name)}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              from {formatDisplayText(subtopic.topic_id.topic_name)}
                            </p>
                          </div>
                        </div>
                        <div className={`transition-all duration-300 ${
                          hoveredSubtopic === subtopic._id 
                            ? 'transform translate-x-1 text-[#C0A063]' 
                            : 'text-gray-400'
                        }`}>
                          <ArrowRight className="h-6 w-6" />
                        </div>
                      </div>

                      {/* Start Practice Button */}
                      <div className="pt-4 border-t border-gray-100">
                        <div className={`text-sm font-normal transition-all duration-300 ${
                          hoveredSubtopic === subtopic._id 
                            ? 'text-[#C0A063]' 
                            : 'text-gray-500'
                        }`}>
                          Start Practice
                        </div>
                      </div>

                      {/* Hover Effect Overlay */}
                      <div className={`absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none ${
                        hoveredSubtopic === subtopic._id 
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

export default RandomTopics;

