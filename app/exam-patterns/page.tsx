import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, FileText } from 'lucide-react';
import { fetchFromApi } from '../../utils/serverApi';
import SearchForm from './SearchForm';

interface ExamPattern {
  _id: string;
  exam_name: string;
  slug: string;
  exam_level: string;
  exam_mode: string;
  total_questions: number;
  total_marks: number;
  duration: number;
  marking_scheme?: {
    correct_answer: number;
    wrong_answer: number;
    negative_marking: boolean;
    negative_marking_value: number;
  };
  featured?: boolean;
  description?: string;
}

interface ExamPatternsPageProps {
  searchParams: Promise<{ search?: string; exam_level?: string }>;
}

async function getAllExamPatterns(): Promise<{ examPatterns: ExamPattern[]; total: number }> {
  try {
    const data = await fetchFromApi('/api/exam-patterns/all?limit=100') as { examPatterns?: ExamPattern[]; pagination?: { total?: number } };
    return {
      examPatterns: data.examPatterns || [],
      total: data.pagination?.total || 0
    };
  } catch (error) {
    console.error('Error fetching exam patterns:', error);
    throw new Error('Failed to load exam patterns');
  }
}

async function getFeaturedExams(): Promise<ExamPattern[]> {
  try {
    const data = await fetchFromApi('/api/exam-patterns/featured/list') as ExamPattern[];
    return data || [];
  } catch (error) {
    console.error('Error fetching featured exams:', error);
    return [];
  }
}

async function getFilterOptions(): Promise<{ examLevels: string[] }> {
  try {
    const data = await fetchFromApi('/api/exam-patterns/meta/filters') as { examLevels?: string[] };
    return { examLevels: data.examLevels || [] };
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return { examLevels: [] };
  }
}

function filterExamPatterns(examPatterns: ExamPattern[], search?: string, exam_level?: string): ExamPattern[] {
  let filtered = [...examPatterns];

  if (search) {
    const searchTerm = search.toLowerCase();
    filtered = filtered.filter(exam => 
      exam.exam_name.toLowerCase().includes(searchTerm) ||
      exam.exam_level.toLowerCase().includes(searchTerm) ||
      exam.exam_mode.toLowerCase().includes(searchTerm) ||
      (exam.description && exam.description.toLowerCase().includes(searchTerm))
    );
  }

  if (exam_level) {
    filtered = filtered.filter(exam => exam.exam_level === exam_level);
  }

  return filtered.slice(0, 12);
}

export default async function ExamPatterns({ searchParams }: ExamPatternsPageProps) {
  const { search, exam_level } = await searchParams;

  let allExamPatterns: ExamPattern[] = [];
  let featuredExams: ExamPattern[] = [];
  let filterOptions: { examLevels: string[] } = { examLevels: [] };
  let stats = { totalExams: 0, featuredCount: 0 };
  let error: string | null = null;

  try {
    const [examData, featuredData, filterData] = await Promise.all([
      getAllExamPatterns(),
      getFeaturedExams(),
      getFilterOptions()
    ]);
    allExamPatterns = examData.examPatterns;
    stats.totalExams = examData.total;
    featuredExams = featuredData;
    stats.featuredCount = featuredData.length;
    filterOptions = filterData;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load exam patterns';
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center p-4">
        <main className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-2xl p-4 inline-block mb-4">
            <AlertCircle className="h-10 w-10 text-red-500" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Something Went Wrong</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            href="/exam-patterns"
            className="bg-[#6366F1] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#5558E3] transition duration-300 inline-block"
            aria-label="Try loading exam patterns again"
          >
            Try Again
          </Link>
        </main>
      </div>
    );
  }

  const examPatterns = filterExamPatterns(allExamPatterns, search, exam_level);

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
        
        <div className="relative max-w-6xl mx-auto px-6 text-center z-10">
          <div className="inline-block mb-5 px-4 py-1.5 bg-[#6366F1] bg-opacity-10 backdrop-blur-sm border border-[#6366F1] border-opacity-30 rounded-full">
            <span className="text-xs font-bold text-[#ffffff] tracking-wider uppercase">Exam Patterns</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-5 leading-[1.1] tracking-tight">
            Exam Patterns & <span className="bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899] text-transparent bg-clip-text">Syllabus</span>
          </h1>
          
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Comprehensive guide for SSC, RRB, Banking, UPSC and other competitive exams. Get detailed exam patterns, marking schemes, and syllabus information.
          </p>
          
          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto">
            <SearchForm search={search} examLevels={filterOptions.examLevels} selectedLevel={exam_level} />
          </div>
        </div>
      </section>

      {/* Featured Exams */}
      {featuredExams.length > 0 && (
        <section className="relative py-12 bg-gradient-to-b from-[#0A0E27] to-[#1a1f3a]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-8">
              <div className="text-xs font-bold text-[#6366F1] mb-2 tracking-widest uppercase">Featured</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                Featured Exams
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredExams.map((exam, index) => (
                <Link
                  key={exam._id}
                  href={`/exam-patterns/${exam.slug}`}
                  className="group relative bg-[#161B33] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col border border-gray-700 hover:border-[#6366F1] shadow-lg shadow-[#6366F1]/20 hover:shadow-2xl hover:shadow-[#6366F1]/50 min-h-[200px]"
                  aria-label={`View exam pattern for ${exam.exam_name}`}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/10 via-transparent to-[#EC4899]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative p-6 flex flex-col flex-grow">
                    {/* Index Number */}
                    <div className="absolute top-4 right-4 text-5xl font-black text-white opacity-40 group-hover:opacity-50 transition-opacity">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-snug relative z-10 pr-8">
                      {exam.exam_name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-auto relative z-10">
                      {exam.exam_level} • {exam.exam_mode}
                    </p>

                    {/* Footer */}
                    <div className="mt-5 pt-4 border-t border-gray-800 relative z-10">
                      {/* CTA */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#6366F1] group-hover:text-[#8B5CF6] transition-colors">
                          View Details
                        </span>
                        <div className="w-10 h-10 bg-[#6366F1] group-hover:bg-gradient-to-br group-hover:from-[#6366F1] group-hover:to-[#8B5CF6] flex items-center justify-center transition-all duration-300 group-hover:rotate-[-45deg] rounded-lg">
                          <ArrowRight className="w-5 h-5 text-white transition-all duration-300" aria-hidden="true" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Exam Patterns */}
      <section id="results-section" className="relative py-12 bg-gradient-to-b from-[#0A0E27] to-[#1a1f3a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-bold text-[#6366F1] mb-2 tracking-widest uppercase">Available Now</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                {examPatterns.length} {examPatterns.length === 1 ? 'Exam Pattern' : 'Exam Patterns'} Ready
              </h2>
            </div>
          </div>
          
          {examPatterns.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-2xl bg-[#161B33]">
              <div className="w-16 h-16 rounded-xl bg-[#0A0E27] border border-gray-800 mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">No Exam Patterns Found</h3>
              <p className="text-sm text-gray-400 mb-6">Try adjusting your search or filters</p>
              <Link
                href="/exam-patterns"
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:bg-[#5558E3] bg-[#6366F1] inline-block"
              >
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {examPatterns.map((exam, index) => (
                <Link
                  key={exam._id}
                  href={`/exam-patterns/${exam.slug}`}
                  className="group relative bg-[#161B33] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col border border-gray-700 hover:border-[#6366F1] shadow-lg shadow-[#6366F1]/20 hover:shadow-2xl hover:shadow-[#6366F1]/50 min-h-[200px]"
                  aria-label={`View exam pattern for ${exam.exam_name}`}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/10 via-transparent to-[#EC4899]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative p-6 flex flex-col flex-grow">
                    {/* Index Number */}
                    <div className="absolute top-4 right-4 text-5xl font-black text-white opacity-40 group-hover:opacity-50 transition-opacity">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-snug relative z-10 pr-8">
                      {exam.exam_name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-auto relative z-10">
                      {exam.exam_level} • {exam.exam_mode}
                    </p>

                    {/* Footer */}
                    <div className="mt-5 pt-4 border-t border-gray-800 relative z-10">
                      {/* CTA */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#6366F1] group-hover:text-[#8B5CF6] transition-colors">
                          View Details
                        </span>
                        <div className="w-10 h-10 bg-[#6366F1] group-hover:bg-gradient-to-br group-hover:from-[#6366F1] group-hover:to-[#8B5CF6] flex items-center justify-center transition-all duration-300 group-hover:rotate-[-45deg] rounded-lg">
                          <ArrowRight className="w-5 h-5 text-white transition-all duration-300" aria-hidden="true" />
                        </div>
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


