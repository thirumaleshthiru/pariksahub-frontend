'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import axiosInstance from '../../../utils/axiosInstance';

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

function ExamPatternDetail() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [examPattern, setExamPattern] = useState<ExamPattern | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchExamPattern();
    }
  }, [slug]);

  const fetchExamPattern = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/exam-patterns/slug/${slug}`);
      setExamPattern(response.data);
      setError('');
    } catch (error) {
      setError('Exam pattern not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div 
            className="rounded-full h-12 w-12 border-3 border-gray-200 border-t-[#C0A063] mx-auto mb-4 animate-spin"
          ></div>
          <p className="text-gray-900 text-sm font-medium">Loading exam details...</p>
        </div>
      </div>
    );
  }

  if (error || !examPattern) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-20">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Exam Pattern Not Found</h2>
          <p className="text-sm text-gray-600 mb-6">
            The exam pattern you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/exam-patterns"
            className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#192A41' }}
          >
            Browse All Exam Patterns
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200 no-print" style={{ marginTop: '64px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <Link
            href="/exam-patterns"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Exam Patterns
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex flex-wrap items-start gap-3 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {examPattern.exam_level}
            </span>
            {examPattern.featured && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: '#C0A063' }}>
                Featured
              </span>
            )}
            {examPattern.views && examPattern.views > 0 && (
              <span className="inline-flex items-center text-xs text-gray-500">
                <Users className="h-3.5 w-3.5 mr-1" />
                {examPattern.views.toLocaleString()} views
              </span>
            )}
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            {examPattern.exam_name}
          </h1>
          
          {examPattern.description && (
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {examPattern.description}
            </p>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold mb-1 text-[#192A41]">
              {examPattern.total_questions}
            </div>
            <div className="text-xs text-gray-600">Questions</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold mb-1 text-[#192A41]">
              {examPattern.total_marks}
            </div>
            <div className="text-xs text-gray-600">Marks</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold mb-1 text-[#192A41]">
              {examPattern.duration}
            </div>
            <div className="text-xs text-gray-600">Minutes</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold mb-1 text-[#192A41]">
              {examPattern.sections?.length || 0}
            </div>
            <div className="text-xs text-gray-600">Sections</div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Marking Scheme */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3" style={{ backgroundColor: '#C0A06315' }}>
                <Target className="h-5 w-5" style={{ color: '#C0A063' }} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Marking Scheme</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Correct Answer</span>
                <span className="text-sm font-semibold text-green-600">+{examPattern.marking_scheme.correct_answer}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Wrong Answer</span>
                <span className="text-sm font-semibold text-red-600">
                  {examPattern.marking_scheme.negative_marking ? `-${examPattern.marking_scheme.negative_marking_value}` : '0'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Negative Marking</span>
                <span className={`text-sm font-semibold ${examPattern.marking_scheme.negative_marking ? 'text-red-600' : 'text-green-600'}`}>
                  {examPattern.marking_scheme.negative_marking ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Exam Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3" style={{ backgroundColor: '#C0A06315' }}>
                <Calendar className="h-5 w-5" style={{ color: '#C0A063' }} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Exam Details</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Mode</span>
                <span className="text-sm font-medium text-gray-900">{examPattern.exam_mode}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Frequency</span>
                <span className="text-sm font-medium text-gray-900">{examPattern.exam_frequency}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Application Fee</span>
                <span className="text-sm font-semibold text-gray-900">₹{examPattern.application_fee}</span>
              </div>
              {examPattern.exam_official_website && (
                <div className="pt-2">
                  <span className="text-sm text-gray-600 block mb-1.5">Official Website</span>
                  <a 
                    href={examPattern.exam_official_website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:underline inline-flex items-center"
                    style={{ color: '#192A41' }}
                  >
                    <Globe className="h-3.5 w-3.5 mr-1" />
                    Visit Website
                  </a>
                </div>
              )}
              {examPattern.language_options && examPattern.language_options.length > 0 && (
                <div className="pt-2">
                  <span className="text-sm text-gray-600 block mb-1.5">Languages</span>
                  <div className="flex flex-wrap gap-2">
                    {examPattern.language_options.map((lang, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3" style={{ backgroundColor: '#C0A06315' }}>
              <FileText className="h-5 w-5" style={{ color: '#C0A063' }} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Exam Sections</h2>
          </div>
          
          {examPattern.sections && examPattern.sections.length > 0 ? (
            <div className="space-y-4">
              {examPattern.sections.map((section, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {section.section_name}
                    </h3>
                    {section.section_code && (
                      <p className="text-xs text-gray-500">Code: {section.section_code}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{section.questions}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{section.total_marks}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Marks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{section.duration}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Minutes</div>
                    </div>
                  </div>
                  
                  {section.topics && section.topics.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Topics Covered</h4>
                      <div className="space-y-2">
                        {section.topics.map((topic, topicIndex) => (
                          <div key={topicIndex} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: '#C0A063' }}></span>
                              {topic.topic_name}
                            </span>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              {topic.difficulty_level}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {section.question_types && section.question_types.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Question Types</h4>
                      <div className="flex flex-wrap gap-2">
                        {section.question_types.map((type, typeIndex) => (
                          <span key={typeIndex} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
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
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No sections available</p>
            </div>
          )}
        </div>

        {/* Eligibility Criteria */}
        {examPattern.eligibility_criteria && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3" style={{ backgroundColor: '#C0A06315' }}>
                <CheckCircle className="h-5 w-5" style={{ color: '#C0A063' }} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Eligibility Criteria</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {examPattern.eligibility_criteria.age_limit && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-500 block mb-1">Age Limit</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {examPattern.eligibility_criteria.age_limit.min} - {examPattern.eligibility_criteria.age_limit.max} years
                  </span>
                </div>
              )}
              {examPattern.eligibility_criteria.education_qualification && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-500 block mb-1">Education</span>
                  <span className="text-sm font-semibold text-gray-900">{examPattern.eligibility_criteria.education_qualification}</span>
                </div>
              )}
              {examPattern.eligibility_criteria.nationality && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-500 block mb-1">Nationality</span>
                  <span className="text-sm font-semibold text-gray-900">{examPattern.eligibility_criteria.nationality}</span>
                </div>
              )}
              {examPattern.eligibility_criteria.experience_required && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-500 block mb-1">Experience</span>
                  <span className="text-sm font-semibold text-gray-900">{examPattern.eligibility_criteria.experience_required}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preparation Strategy */}
        {examPattern.preparation_strategy && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3" style={{ backgroundColor: '#C0A06315' }}>
                <BookOpen className="h-5 w-5" style={{ color: '#C0A063' }} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Preparation Strategy</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                {examPattern.preparation_strategy.recommended_study_time && (
                  <div className="mb-5">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-1.5" style={{ color: '#C0A063' }} />
                      Recommended Study Time
                    </h4>
                    <p className="text-sm text-gray-700">{examPattern.preparation_strategy.recommended_study_time}</p>
                  </div>
                )}
                
                {examPattern.preparation_strategy.important_topics && examPattern.preparation_strategy.important_topics.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Important Topics</h4>
                    <ul className="space-y-2">
                      {examPattern.preparation_strategy.important_topics.map((topic, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 mr-2" style={{ backgroundColor: '#C0A063' }}></span>
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
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Practice Tips</h4>
                    <ul className="space-y-2">
                      {examPattern.preparation_strategy.practice_tips.map((tip, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 mr-2" style={{ backgroundColor: '#C0A063' }}></span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {examPattern.success_rate && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-xs text-gray-500 mb-1">Success Rate</h4>
                    <span className="text-sm font-semibold text-gray-900">{examPattern.success_rate}</span>
                  </div>
                )}
              </div>
            </div>

            {examPattern.preparation_strategy.reference_books && examPattern.preparation_strategy.reference_books.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Reference Books</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {examPattern.preparation_strategy.reference_books.map((book, index) => (
                    <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <BookOpen className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#C0A063' }} />
                      <span className="text-sm text-gray-700">{book}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {examPattern.preparation_strategy.online_resources && examPattern.preparation_strategy.online_resources.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Online Resources</h4>
                <div className="flex flex-wrap gap-2">
                  {examPattern.preparation_strategy.online_resources.map((resource, index) => (
                    <span key={index} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#C0A063' }}>
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Difficulty Level</span>
                  <Award className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    examPattern.difficulty_level === 'Easy' ? 'bg-green-500' :
                    examPattern.difficulty_level === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-semibold text-gray-900">{examPattern.difficulty_level}</span>
                </div>
              </div>
            )}

            {examPattern.competition_level && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Competition Level</span>
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    examPattern.competition_level === 'Low' ? 'bg-green-500' :
                    examPattern.competition_level === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-semibold text-gray-900">{examPattern.competition_level}</span>
                </div>
              </div>
            )}

            {examPattern.average_score && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Average Score</span>
                  <Target className="h-4 w-4 text-gray-400" />
                </div>
                <span className="text-lg font-bold" style={{ color: '#C0A063' }}>{examPattern.average_score}</span>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {examPattern.tags && examPattern.tags.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Related Tags</h3>
            <div className="flex flex-wrap gap-2">
              {examPattern.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExamPatternDetail;

