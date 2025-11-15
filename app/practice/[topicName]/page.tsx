import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowUpRight, Search, X } from 'lucide-react';
import { fetchFromApi } from '../../../utils/serverApi';
import { formatDisplayText } from '../../../utils/textUtils';
import ExamFilter from './ExamFilter';

interface Subtopic {
  _id: string;
  subtopic_name: string;
  category?: string;
}

interface Exam {
  _id: string;
  exam_name: string;
}

interface PracticeSubtopicsPageProps {
  params: Promise<{ topicName: string }>;
  searchParams: Promise<{ search?: string; exam?: string }>;
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

async function getExams(): Promise<Exam[]> {
  try {
    const data = await fetchFromApi('/api/exams/all') as Exam[];
    return data || [];
  } catch (error) {
    console.error('Error fetching exams:', error);
    return [];
  }
}

function filterSubtopics(subtopics: Subtopic[], search?: string): Subtopic[] {
  if (!search) return subtopics;
  const searchTerm = search.toLowerCase();
  return subtopics.filter(subtopic =>
    subtopic.subtopic_name.toLowerCase().includes(searchTerm) ||
    (subtopic.category && subtopic.category.toLowerCase().includes(searchTerm))
  );
}

function groupSubtopics(subtopics: Subtopic[]): Record<string, Subtopic[]> {
  return subtopics.reduce((acc: Record<string, Subtopic[]>, subtopic) => {
    const category = subtopic.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(subtopic);
    return acc;
  }, {});
}

export default async function SubTopics({ params, searchParams }: PracticeSubtopicsPageProps) {
  const { topicName } = await params;
  const { search, exam } = await searchParams;
  const selectedExam = exam || '';
  
  let subtopics: Subtopic[] = [];
  let exams: Exam[] = [];
  let error: string | null = null;

  try {
    [subtopics, exams] = await Promise.all([
      getSubtopics(topicName),
      getExams()
    ]);
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
            href={`/practice/${topicName}`}
            className="bg-[#6366F1] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#5558E3] transition duration-300 inline-block"
            aria-label="Try loading subtopics again"
          >
            Try Again
          </Link>
        </main>
      </div>
    );
  }

  const filteredSubtopics = filterSubtopics(subtopics, search);
  const groupedSubtopics = groupSubtopics(filteredSubtopics);

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
            <Link href="/practice" className="hover:text-white transition-colors" aria-label="Go to practice topics">Practice</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-[#6366F1] font-medium">{formatDisplayText(topicName)}</span>
          </nav>

           
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-5 leading-[1.1] tracking-tight">
            <span>{formatDisplayText(topicName)}  <span className="block bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899] text-transparent bg-clip-text pb-3">Practice Topics</span></span>
          </h1>
          
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Choose a specific topic to practice and master your skills. Select from the available topics below to start practicing.
          </p>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-center max-w-2xl mx-auto">
              {/* Exam Filter */}
              <ExamFilter 
                topicName={topicName}
                exams={exams}
                selectedExam={selectedExam}
                search={search}
              />

              {/* Search */}
              <div className="relative flex-1 sm:max-w-md">
                <form action={`/practice/${topicName}`} method="get" className="relative">
                  <input type="hidden" name="exam" value={selectedExam} />
                  <div className={`relative bg-[#161B33] border rounded-lg transition-all duration-300 ${
                    search ? 'border-[#6366F1] ring-2 ring-[#6366F1]/20' : 'border-gray-800'
                  }`}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      name="search"
                      defaultValue={search || ''}
                      placeholder="Search subtopics..."
                      className="block w-full pl-10 pr-10 py-2.5 text-white placeholder-gray-500 bg-transparent focus:outline-none focus:ring-0 text-sm"
                      aria-label="Search subtopics by name"
                    />
                    {search && (
                      <Link
                        href={`/practice/${topicName}${selectedExam ? `?exam=${encodeURIComponent(selectedExam)}` : ''}`}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                  <button type="submit" className="sr-only" aria-label="Submit search">Search</button>
                </form>
                
                {search && (
                  <div className="absolute top-full left-0 mt-2 text-sm text-gray-400">
                    {filteredSubtopics.length} subtopic{filteredSubtopics.length !== 1 ? 's' : ''} found
                  </div>
                )}
              </div>
            </div>
        </div>
      </section>

      {/* Subtopics Section */}
      <section id="results-section" className="relative py-12 bg-gradient-to-b from-[#0A0E27] to-[#1a1f3a]">
        <div className="max-w-6xl mx-auto px-6">
          {search && filteredSubtopics.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-700 rounded-2xl bg-white bg-opacity-5">
              <div className="w-16 h-16 rounded-xl bg-[#161B33] border border-gray-800 mx-auto mb-4 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">No Results Found</h3>
              <p className="text-sm text-gray-400 mb-6">
                No subtopics match your search for "{search}". Try a different search term.
              </p>
              <Link
                href={`/practice/${topicName}${selectedExam ? `?exam=${encodeURIComponent(selectedExam)}` : ''}`}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:bg-[#5558E3] bg-[#6366F1] inline-block"
                aria-label="Clear search and show all subtopics"
              >
                Clear Search
              </Link>
            </div>
          ) : Object.keys(groupedSubtopics).length === 0 && !search ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-700 rounded-2xl bg-white bg-opacity-5">
              <div className="w-16 h-16 rounded-xl bg-[#161B33] border border-gray-800 mx-auto mb-4" aria-hidden="true"></div>
              <h3 className="text-xl font-bold mb-2 text-white">No Subtopics Available</h3>
              <p className="text-sm text-gray-400">Subtopics will appear here once they are added for this topic.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(groupedSubtopics).map(([category, categorySubtopics]) => (
                <div key={category}>
                  <div className="mb-8">
                  <div className="text-xs font-bold text-[#6366F1] mb-2 tracking-widest uppercase">Available Now</div>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                      {categorySubtopics.length} {categorySubtopics.length === 1 ? 'topic' : 'topics'} available
                    </p>


                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {categorySubtopics.map((subtopic, index) => {
                      const targetRoute = selectedExam 
                        ? `/practice/${topicName}/${subtopic.subtopic_name}?exam=${encodeURIComponent(selectedExam)}`
                        : `/practice/${topicName}/${subtopic.subtopic_name}`;
                      return (
                        <Link
                          key={subtopic._id}
                          href={targetRoute}
                          className="group relative bg-[#161B33] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col border border-gray-700 hover:border-[#6366F1] shadow-lg shadow-[#6366F1]/20 hover:shadow-2xl hover:shadow-[#6366F1]/50 min-h-[200px]"
                          aria-label={`Start practicing ${formatDisplayText(subtopic.subtopic_name)}`}
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
                              {formatDisplayText(subtopic.subtopic_name)}
                            </h3>

                            {/* Footer */}
                            <div className="mt-5 flex justify-between items-center relative z-10">
                              <span className="text-sm font-bold text-[#6366F1] group-hover:text-[#8B5CF6] transition-colors">
                                Start Practice
                              </span>
                              <div className="w-10 h-10 bg-[#6366F1] group-hover:bg-gradient-to-br group-hover:from-[#6366F1] group-hover:to-[#8B5CF6] flex items-center justify-center transition-all duration-300 group-hover:rotate-45 rounded-lg">
                                <ArrowUpRight className="w-5 h-5 text-white transition-all duration-300" aria-hidden="true" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

