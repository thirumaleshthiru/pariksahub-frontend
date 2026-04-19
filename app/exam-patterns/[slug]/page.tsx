
import Link from 'next/link';
import {
  ArrowLeft,
  Target,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Award,
  BookOpen,
  Globe,
  TrendingUp,
  Users
} from 'lucide-react';
import { fetchFromApi } from '../../../utils/serverApi';

interface Section {
  section_name: string;
  section_code?: string;
  questions: number;
  total_marks: number;
  duration: number;
  topics?: Array<{
    topic_name: string;
    difficulty_level: string;
  }>;
  question_types?: string[];
}

interface EligibilityCriteria {
  age_limit?: { min: number; max: number };
  education_qualification?: string;
  nationality?: string;
  experience_required?: string;
}

interface PreparationStrategy {
  recommended_study_time?: string;
  important_topics?: string[];
  practice_tips?: string[];
  reference_books?: string[];
  online_resources?: string[];
}

interface ExamPattern {
  _id: string;
  exam_name: string;
  slug: string;
  exam_level: string;
  exam_mode: string;
  exam_frequency: string;
  application_fee: number;
  exam_official_website?: string;
  language_options?: string[];
  total_questions: number;
  total_marks: number;
  duration: number;
  sections?: Section[];
  marking_scheme: {
    correct_answer: number;
    wrong_answer: number;
    negative_marking: boolean;
    negative_marking_value: number;
  };
  eligibility_criteria?: EligibilityCriteria;
  preparation_strategy?: PreparationStrategy;
  difficulty_level?: string;
  competition_level?: string;
  average_score?: string;
  success_rate?: string;
  featured?: boolean;
  description?: string;
  tags?: string[];
  views?: number;
}

interface ExamPatternDetailPageProps {
  params: Promise<{ slug: string }>;
}

async function getExamPattern(slug: string): Promise<ExamPattern | null> {
  try {
    const data = await fetchFromApi(`/api/exam-patterns/slug/${encodeURIComponent(slug)}`) as ExamPattern;
    return data || null;
  } catch (error) {
    console.error('Error fetching exam pattern:', error);
    return null;
  }
}

export default async function ExamPatternDetail({ params }: ExamPatternDetailPageProps) {
  const { slug } = await params;

  let examPattern: ExamPattern | null = null;
  let error: string | null = null;

  try {
    examPattern = await getExamPattern(slug);
    if (!examPattern) {
      error = 'Exam pattern not found';
    }
  } catch (err) {
    error = 'Failed to load exam pattern';
  }

  if (error || !examPattern) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center px-4 pt-20">
        <main className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500 bg-opacity-10 border border-red-500 mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Exam Pattern Not Found</h1>
          <p className="text-sm text-gray-400 mb-6 font-semibold">
            The exam pattern you're looking for doesn't exist or has been removed.
          </p>
          <Link
            prefetch
            href="/exam-patterns"
            className="inline-flex items-center px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-colors hover:bg-[#5558E3] cursor-pointer bg-[#6366F1]"
          >
            Browse All Exam Patterns
          </Link>
        </main>
      </div>
    );
  }

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

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 z-10">
          {/* Header */}
          <div className="no-print mb-3 sm:mb-6 print:hidden">
            <Link
              prefetch
              href="/exam-patterns"
              className="text-sm text-gray-400 hover:text-white flex items-center gap-2 mb-2 sm:mb-4 transition-colors"
              aria-label="Back to exam patterns list"
            >
              <ArrowLeft className="h-4 w-4 text-gray-400" aria-hidden="true" />
              Back
            </Link>
          </div>

          {/* Title Section */}
          <div className="border-b-4 border-[#6366F1] pb-1 sm:pb-2 mb-1 sm:mb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-start gap-3 mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#161B33] text-white border border-gray-700">
                    {examPattern.exam_level}
                  </span>
                  {examPattern.featured && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-[#6366F1] border border-[#6366F1]">
                      Featured
                    </span>
                  )}
                  {examPattern.views && examPattern.views > 0 && (
                    <span className="inline-flex items-center text-xs text-gray-400 font-semibold">
                      <Users className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      {examPattern.views.toLocaleString()} views
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-1 sm:mb-2">
                  {examPattern.exam_name}
                </h1>

                {examPattern.description && (
                  <p className="text-base sm:text-lg text-gray-400 mt-2 sm:mt-3 leading-relaxed">
                    {examPattern.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative pt-1 sm:pt-2 pb-4 sm:pb-6 bg-gradient-to-b from-[#0A0E27] to-[#1a1f3a]">
        <div className="max-w-6xl mx-auto px-6">

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#161B33] rounded-xl border border-gray-800 p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold mb-1 text-white">
                {examPattern.total_questions}
              </div>
              <div className="text-xs text-gray-400 font-semibold">Questions</div>
            </div>
            <div className="bg-[#161B33] rounded-xl border border-gray-800 p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold mb-1 text-white">
                {examPattern.total_marks}
              </div>
              <div className="text-xs text-gray-400 font-semibold">Marks</div>
            </div>
            <div className="bg-[#161B33] rounded-xl border border-gray-800 p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold mb-1 text-white">
                {examPattern.duration}
              </div>
              <div className="text-xs text-gray-400 font-semibold">Minutes</div>
            </div>
            <div className="bg-[#161B33] rounded-xl border border-gray-800 p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold mb-1 text-white">
                {examPattern.sections?.length || 0}
              </div>
              <div className="text-xs text-gray-400 font-semibold">Sections</div>
            </div>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Marking Scheme */}
            <div className="bg-[#161B33] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-[#6366F1] bg-opacity-20">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Marking Scheme</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-sm text-white/80 font-semibold">Correct Answer</span>
                  <span className="text-sm font-bold text-emerald-500">+{examPattern.marking_scheme.correct_answer}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-sm text-white/80 font-semibold">Wrong Answer</span>
                  <span className="text-sm font-bold text-red-400">
                    {examPattern.marking_scheme.negative_marking ? `-${examPattern.marking_scheme.negative_marking_value}` : '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-white/80 font-semibold">Negative Marking</span>
                  <span className={`text-sm font-semibold ${examPattern.marking_scheme.negative_marking ? 'text-red-400' : 'text-emerald-500'}`}>
                    {examPattern.marking_scheme.negative_marking ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Exam Details */}
            <div className="bg-[#161B33] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-[#6366F1] bg-opacity-20">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Exam Details</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-sm text-white/80 font-semibold">Mode</span>
                  <span className="text-sm font-bold text-white">{examPattern.exam_mode}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-sm text-white/80 font-semibold">Frequency</span>
                  <span className="text-sm font-bold text-white">{examPattern.exam_frequency}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-white/80 font-semibold">Application Fee</span>
                  <span className="text-sm font-bold text-white">₹{examPattern.application_fee}</span>
                </div>
                {examPattern.exam_official_website && (
                  <div className="pt-2">
                    <span className="text-sm text-white/80 font-semibold block mb-1.5">Official Website</span>
                    <a
                      href={examPattern.exam_official_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:underline inline-flex items-center text-[#6366F1]"
                    >
                      <Globe className="h-3.5 w-3.5 mr-1 text-[#6366F1]" />
                      Visit Website
                    </a>
                  </div>
                )}
                {examPattern.language_options && examPattern.language_options.length > 0 && (
                  <div className="pt-2">
                    <span className="text-sm text-white/80 font-semibold block mb-1.5">Languages</span>
                    <div className="flex flex-wrap gap-2">
                      {examPattern.language_options.map((lang, idx) => (
                        <span key={idx} className="px-2 py-1 bg-[#0A0E27] text-white border border-gray-700 rounded text-xs font-semibold">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Exam Sections */}
          <div className="bg-[#161B33] rounded-xl border border-gray-800 p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-[#6366F1] bg-opacity-20">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white">Exam Sections</h2>
            </div>

            {examPattern.sections && examPattern.sections.length > 0 ? (
              <div className="space-y-4">
                {examPattern.sections.map((section, index) => (
                  <div key={index} className="border border-gray-800 rounded-xl p-5 bg-[#0A0E27] hover:border-[#6366F1] transition-all">
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-white mb-1">
                        {section.section_name}
                      </h3>

                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-800">
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">{section.questions}</div>
                        <div className="text-xs text-gray-400 font-semibold mt-0.5">Questions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">{section.total_marks}</div>
                        <div className="text-xs text-gray-400 font-semibold mt-0.5">Marks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">{section.duration}</div>
                        <div className="text-xs text-gray-400 font-semibold mt-0.5">Minutes</div>
                      </div>
                    </div>

                    {section.topics && section.topics.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-bold text-white mb-3">Topics Covered</h4>
                        <div className="space-y-2">
                          {section.topics.map((topic, topicIndex) => (
                            <div key={topicIndex} className="flex items-center justify-between text-sm">
                              <span className="text-white/80 flex items-center font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full mr-2 bg-[#6366F1]"></span>
                                {topic.topic_name}
                              </span>
                              <span className="text-xs px-2 py-1 bg-[#161B33] text-white border border-gray-700 font-semibold rounded">
                                {topic.difficulty_level}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {section.question_types && section.question_types.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-white mb-2">Question Types</h4>
                        <div className="flex flex-wrap gap-2">
                          {section.question_types.map((type, typeIndex) => (
                            <span key={typeIndex} className="px-3 py-1.5 bg-[#6366F1] text-white rounded-lg text-xs font-bold">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-semibold">No sections available</p>
              </div>
            )}
          </div>

          {/* Eligibility Criteria */}
          {examPattern.eligibility_criteria && (
            <div className="bg-[#161B33] rounded-xl border border-gray-800 p-6 mb-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-[#6366F1] bg-opacity-20">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Eligibility Criteria</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {examPattern.eligibility_criteria.age_limit && (
                  <div className="p-4 bg-[#0A0E27] rounded-lg border border-gray-800">
                    <span className="text-xs text-gray-400 font-semibold block mb-1">Age Limit</span>
                    <span className="text-sm font-bold text-white">
                      {examPattern.eligibility_criteria.age_limit.min} - {examPattern.eligibility_criteria.age_limit.max} years
                    </span>
                  </div>
                )}
                {examPattern.eligibility_criteria.education_qualification && (
                  <div className="p-4 bg-[#0A0E27] rounded-lg border border-gray-800">
                    <span className="text-xs text-gray-400 font-semibold block mb-1">Education</span>
                    <span className="text-sm font-bold text-white">{examPattern.eligibility_criteria.education_qualification}</span>
                  </div>
                )}
                {examPattern.eligibility_criteria.nationality && (
                  <div className="p-4 bg-[#0A0E27] rounded-lg border border-gray-800">
                    <span className="text-xs text-gray-400 font-semibold block mb-1">Nationality</span>
                    <span className="text-sm font-bold text-white">{examPattern.eligibility_criteria.nationality}</span>
                  </div>
                )}
                {examPattern.eligibility_criteria.experience_required && (
                  <div className="p-4 bg-[#0A0E27] rounded-lg border border-gray-800">
                    <span className="text-xs text-gray-400 font-semibold block mb-1">Experience</span>
                    <span className="text-sm font-bold text-white">{examPattern.eligibility_criteria.experience_required}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preparation Strategy */}
          {examPattern.preparation_strategy && (
            <div className="bg-[#161B33] rounded-xl border border-gray-800 p-6 mb-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-[#6366F1] bg-opacity-20">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Preparation Strategy</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  {examPattern.preparation_strategy.recommended_study_time && (
                    <div className="mb-5">
                      <h4 className="text-sm font-bold text-white mb-2 flex items-center">
                        <Clock className="h-4 w-4 mr-1.5 text-white" />
                        Recommended Study Time
                      </h4>
                      <p className="text-sm text-white/80 font-medium">{examPattern.preparation_strategy.recommended_study_time}</p>
                    </div>
                  )}

                  {examPattern.preparation_strategy.important_topics && examPattern.preparation_strategy.important_topics.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-white mb-3">Important Topics</h4>
                      <ul className="space-y-2">
                        {examPattern.preparation_strategy.important_topics.map((topic, index) => (
                          <li key={index} className="text-sm text-white/80 font-medium flex items-start">
                            <span className="w-1.5 h-1.5 rounded-full mt-1.5 mr-2 bg-[#6366F1]"></span>
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  {examPattern.preparation_strategy.practice_tips && examPattern.preparation_strategy.practice_tips.length > 0 && (
                    <div className="mb-5">
                      <h4 className="text-sm font-bold text-white mb-3">Practice Tips</h4>
                      <ul className="space-y-2">
                        {examPattern.preparation_strategy.practice_tips.map((tip, index) => (
                          <li key={index} className="text-sm text-white/80 font-medium flex items-start">
                            <span className="w-1.5 h-1.5 rounded-full mt-1.5 mr-2 bg-[#6366F1]"></span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {examPattern.success_rate && (
                    <div className="p-4 bg-[#0A0E27] rounded-lg border border-gray-800">
                      <h4 className="text-xs text-gray-400 font-semibold mb-1">Success Rate</h4>
                      <span className="text-sm font-bold text-white">{examPattern.success_rate}</span>
                    </div>
                  )}
                </div>
              </div>

              {examPattern.preparation_strategy.reference_books && examPattern.preparation_strategy.reference_books.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <h4 className="text-sm font-bold text-white mb-3">Reference Books</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {examPattern.preparation_strategy.reference_books.map((book, index) => (
                      <div key={index} className="flex items-start p-3 bg-[#0A0E27] rounded-lg border border-gray-800">
                        <BookOpen className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-white" />
                        <span className="text-sm text-white/80 font-medium">{book}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {examPattern.preparation_strategy.online_resources && examPattern.preparation_strategy.online_resources.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <h4 className="text-sm font-bold text-white mb-3">Online Resources</h4>
                  <div className="flex flex-wrap gap-2">
                    {examPattern.preparation_strategy.online_resources.map((resource, index) => (
                      <span key={index} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#6366F1]">
                        {resource}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Exam Statistics */}
          {(examPattern.difficulty_level || examPattern.competition_level || examPattern.average_score) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {examPattern.difficulty_level && (
                <div className="bg-[#161B33] rounded-xl border border-gray-800 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/80 font-semibold">Difficulty Level</span>
                    <Award className="h-4 w-4 text-[#6366F1]" />
                  </div>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${examPattern.difficulty_level === 'Easy' ? 'bg-emerald-500' :
                      examPattern.difficulty_level === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                      }`}></div>
                    <span className="text-sm font-bold text-white">{examPattern.difficulty_level}</span>
                  </div>
                </div>
              )}

              {examPattern.competition_level && (
                <div className="bg-[#161B33] rounded-xl border border-gray-800 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/80 font-semibold">Competition Level</span>
                    <TrendingUp className="h-4 w-4 text-[#6366F1]" />
                  </div>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${examPattern.competition_level === 'Low' ? 'bg-emerald-500' :
                      examPattern.competition_level === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                      }`}></div>
                    <span className="text-sm font-bold text-white">{examPattern.competition_level}</span>
                  </div>
                </div>
              )}

              {examPattern.average_score && (
                <div className="bg-[#161B33] rounded-xl border border-gray-800 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/80 font-semibold">Average Score</span>
                    <Target className="h-4 w-4 text-[#6366F1]" />
                  </div>
                  <span className="text-lg font-bold text-[#6366F1]">{examPattern.average_score}</span>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {examPattern.tags && examPattern.tags.length > 0 && (
            <div className="bg-[#161B33] rounded-xl border border-gray-800 p-6">
              <h3 className="text-sm font-bold text-white mb-3">Related Tags</h3>
              <div className="flex flex-wrap gap-2">
                {examPattern.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1.5 bg-[#0A0E27] text-white border border-gray-700 rounded-lg text-xs font-semibold">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

