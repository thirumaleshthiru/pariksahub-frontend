'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ChevronDown, FileText, ArrowRight, Search, X } from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';
import { formatDisplayText } from '../../../utils/textUtils';

export default function SubTopics() {
  const params = useParams();
  const router = useRouter();
  const topicName = params.topicName as string;
  
  const [subtopics, setSubtopics] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const [hoveredSubtopic, setHoveredSubtopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (topicName) {
      fetchSubtopics();
      fetchExams();
    }
  }, [topicName]);

  const fetchSubtopics = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/subtopics/topicname/${topicName}`);
      setSubtopics(response.data);
    } catch (error) {
      setError('Failed to load subtopics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await axiosInstance.get('/api/exams/all');
      setExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const handleSubtopicClick = (subtopicName: string) => {
    const targetRoute = selectedExam 
      ? `/practice/${topicName}/${subtopicName}/${selectedExam}`
      : `/practice/${topicName}/${subtopicName}`;
    router.push(targetRoute);
  };

  const handleExamSelect = (examName: string) => {
    setSelectedExam(examName);
    setExamDropdownOpen(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const filteredSubtopics = subtopics.filter(subtopic =>
    subtopic.subtopic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (subtopic.category && subtopic.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const groupedSubtopics = filteredSubtopics.reduce((acc: any, subtopic) => {
    const category = subtopic.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(subtopic);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="bg-gray-50">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#C0A063] mx-auto mb-6 animate-spin"></div>
            <p className="text-[#192A41] text-lg font-semibold">Loading subtopics...</p>
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
              onClick={fetchSubtopics}
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
        <section className="bg-[#192A41] text-white mt-10">
          <div className="container mx-auto px-6 py-8">
            <nav className="mb-8 text-sm text-gray-300">
              <Link href="/practice" className="hover:text-white transition duration-300">Practice</Link>
              <span className="mx-2">/</span>
              <span className="text-[#C0A063] font-medium">{formatDisplayText(topicName)}</span>
            </nav>
            
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                {formatDisplayText(topicName)} <span className="text-[#C0A063]">Subtopics</span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                Choose a specific subtopic to practice and master your skills.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <div className="relative">
                  <button
                    onClick={() => setExamDropdownOpen(!examDropdownOpen)}
                    className="bg-white/10 backdrop-blur-sm border border-gray-500 rounded-lg px-6 py-3 min-w-[200px] text-left flex items-center justify-between hover:bg-white/20 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm">
                        {selectedExam ? formatDisplayText(selectedExam).toUpperCase() : 'Choose Exam'} 
                        <span className="text-gray-400 ml-1">{!selectedExam &&  `(optional)`}</span>
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>

                  {examDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                      <div className="py-1">
                        <button
                          onClick={() => handleExamSelect('')}
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                        >
                          All Exams
                        </button>
                        {exams.map((exam) => (
                          <button
                            key={exam._id}
                            onClick={() => handleExamSelect(exam.exam_name)}
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                          >
                            {formatDisplayText(exam.exam_name).toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative w-full sm:w-80">
                  <div className={`relative bg-white/10 backdrop-blur-sm border rounded-lg transition-all duration-300 ${
                    searchFocused ? 'border-[#C0A063] ring-2 ring-[#C0A063]/20' : 'border-gray-500'
                  }`}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      placeholder="Search subtopics..."
                      className="block w-full pl-10 pr-10 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-0 text-sm"
                    />
                    {searchQuery && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          onClick={clearSearch}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {searchQuery && (
                    <div className="absolute top-full left-0 mt-2 text-sm text-gray-300">
                      {filteredSubtopics.length} subtopic{filteredSubtopics.length !== 1 ? 's' : ''} found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            {searchQuery && filteredSubtopics.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-white rounded-2xl p-12 max-w-md mx-auto shadow-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#192A41] mb-4">No Results Found</h3>
                  <p className="text-gray-600 mb-6">
                    No subtopics match your search for "{searchQuery}". Try a different search term.
                  </p>
                  <button
                    onClick={clearSearch}
                    className="bg-[#C0A063] text-white font-semibold px-6 py-2 rounded-full hover:bg-opacity-90 transition duration-300"
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            ) : Object.keys(groupedSubtopics).length === 0 && !searchQuery ? (
              <div className="text-center py-20">
                <div className="bg-white rounded-2xl p-12 max-w-md mx-auto shadow-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6"></div>
                  <h3 className="text-2xl font-bold text-[#192A41] mb-4">No Subtopics Available</h3>
                  <p className="text-gray-600">Subtopics will appear here once they are added for this topic.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-16">
                {Object.entries(groupedSubtopics).map(([category, categorySubtopics]: [string, any]) => (
                  <div key={category}>
                    <div className="text-center mb-16">
                      <h3 className="text-3xl font-bold text-[#192A41] mb-3">
                        {category}
                        {searchQuery && (
                          <span className="text-lg font-normal text-gray-500 ml-2">
                            ({categorySubtopics.length} result{categorySubtopics.length !== 1 ? 's' : ''})
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-600 text-lg">Select a subtopic to begin practicing.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {categorySubtopics.map((subtopic: any) => (
                        <div
                          key={subtopic._id}
                          onClick={() => handleSubtopicClick(subtopic.subtopic_name)}
                          onMouseEnter={() => setHoveredSubtopic(subtopic._id)}
                          onMouseLeave={() => setHoveredSubtopic(null)}
                          className="relative group cursor-pointer transition-all duration-300 hover:-translate-y-1"
                        >
                          <div className="bg-white border border-gray-200 rounded-2xl p-6 h-full flex flex-col justify-between hover:border-[#C0A063] hover:shadow-xl transition-all duration-300">
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex items-start space-x-3 flex-1 pr-4">
                                <div className={`bg-[#C0A063] text-white rounded-full p-2 transition-transform duration-300 flex-shrink-0 ${
                                  hoveredSubtopic === subtopic._id ? 'scale-110' : ''
                                }`}>
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-xl font-semibold text-[#192A41] leading-snug">
                                    {formatDisplayText(subtopic.subtopic_name)}
                                  </h4>
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

                            <div className="pt-4 border-t border-gray-100">
                              <div className={`text-sm font-medium transition-all duration-300 ${
                                hoveredSubtopic === subtopic._id 
                                  ? 'text-[#C0A063]' 
                                  : 'text-gray-500'
                              }`}>
                                Start Practice
                              </div>
                            </div>

                            <div className={`absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none ${
                              hoveredSubtopic === subtopic._id 
                                ? 'bg-gradient-to-br from-[#C0A063]/5 to-transparent' 
                                : ''
                            }`}></div>
                          </div>
                        </div>
                      ))}
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

