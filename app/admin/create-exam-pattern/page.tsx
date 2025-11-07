'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  BookOpen,
  Trophy,
  Award,
  Shield,
  Brain,
  Heart,
  FileText,
  Users,
  Calendar,
  Settings
} from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import { AxiosError } from 'axios';

interface Topic {
  topic_name: string;
  weightage: number;
  difficulty_level: string;
}

interface Section {
  section_name: string;
  section_code: string;
  questions: number;
  marks_per_question: number;
  total_marks: number;
  duration: number;
  topics: Topic[];
  question_types: string[];
}

interface FormData {
  exam_name: string;
  slug?: string;
  exam_level: string;
  total_questions: number;
  total_marks: number;
  duration: number;
  sections: Section[];
  marking_scheme: {
    correct_answer: number;
    wrong_answer: number;
    negative_marking: boolean;
    negative_marking_value: number;
  };
  eligibility_criteria: {
    age_limit: { min: number; max: number };
    education_qualification: string;
    nationality: string;
    experience_required: string;
  };
  exam_frequency: string;
  application_fee: number;
  exam_mode: string;
  language_options: string[];
  important_dates: any[];
  preparation_strategy: {
    recommended_study_time: string;
    important_topics: string[];
    practice_tips: string[];
    reference_books: string[];
    online_resources: string[];
  };
  difficulty_level: string;
  competition_level: string;
  success_rate: string;
  average_score: string;
  exam_official_website: string;
  cutoff_marks: {
    general: string;
    obc: string;
    sc: string;
    st: string;
  };
  is_active: boolean;
  featured: boolean;
  tags: string[];
  description: string;
  exam_logo: string;
  exam_color: string;
}

function CreateExamPattern() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    exam_name: '',
    exam_level: 'All',
    total_questions: 100,
    total_marks: 100,
    duration: 120,
    sections: [{
      section_name: '',
      section_code: '',
      questions: 25,
      marks_per_question: 1,
      total_marks: 25,
      duration: 30,
      topics: [],
      question_types: ['MCQ']
    }],
    marking_scheme: {
      correct_answer: 1,
      wrong_answer: 0,
      negative_marking: false,
      negative_marking_value: 0
    },
    eligibility_criteria: {
      age_limit: { min: 18, max: 35 },
      education_qualification: '',
      nationality: 'Indian',
      experience_required: ''
    },
    exam_frequency: 'Annual',
    application_fee: 0,
    exam_mode: 'Online',
    language_options: ['English', 'Hindi'],
    important_dates: [],
    preparation_strategy: {
      recommended_study_time: '',
      important_topics: [],
      practice_tips: [],
      reference_books: [],
      online_resources: []
    },
    difficulty_level: 'Medium',
    competition_level: 'Medium',
    success_rate: '10-15%',
    average_score: '60-70',
    exam_official_website: '',
    cutoff_marks: {
      general: '',
      obc: '',
      sc: '',
      st: ''
    },
    is_active: true,
    featured: false,
    tags: [],
    description: '',
    exam_logo: '',
    exam_color: '#3B82F6'
  });

  // Auto-generate slug when exam name changes (only if not manually edited)
  useEffect(() => {
    if (!slugManuallyEdited && formData.exam_name) {
      const autoSlug = formData.exam_name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug: autoSlug }));
    }
  }, [formData.exam_name, slugManuallyEdited]);

  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, {
        section_name: '',
        section_code: '',
        questions: 25,
        marks_per_question: 1,
        total_marks: 25,
        duration: 30,
        topics: [],
        question_types: ['MCQ']
      }]
    }));
  };

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const updateSection = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const addTopic = (sectionIndex: number) => {
    const newTopic = {
      topic_name: '',
      weightage: 0,
      difficulty_level: 'Medium'
    };
    
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === sectionIndex 
          ? { ...section, topics: [...section.topics, newTopic] }
          : section
      )
    }));
  };

  const removeTopic = (sectionIndex: number, topicIndex: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === sectionIndex 
          ? { ...section, topics: section.topics.filter((_, j) => j !== topicIndex) }
          : section
      )
    }));
  };

  const updateTopic = (sectionIndex: number, topicIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === sectionIndex 
          ? { 
              ...section, 
              topics: section.topics.map((topic, j) => 
                j === topicIndex ? { ...topic, [field]: value } : topic
              )
            }
          : section
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await axiosInstance.post('/api/exam-patterns/admin/create', formData);
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/manage-exam-patterns');
      }, 2000);
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to create exam pattern');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="p-2 text-white hover:text-blue-300 hover:bg-white/10 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-slate-900" />
              </div>
              <h1 className="text-xl font-bold text-white">Create New Exam Pattern</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-500/20 border border-green-500/50 text-green-200 px-6 py-4 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Exam pattern created successfully! Redirecting...</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FileText className="h-6 w-6 mr-3" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Exam Name *</label>
                <input
                  type="text"
                  value={formData.exam_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, exam_name: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., SSC CGL, RRB NTPC, Banking PO"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Slug (URL-friendly identifier)</label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setFormData(prev => ({ ...prev, slug: e.target.value }));
                  }}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ssc-cgl, rrb-ntpc, banking-po"
                />
                <p className="text-xs text-gray-400 mt-1">Auto-generates from exam name, but you can edit it</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Exam Level *</label>
                <select
                  value={formData.exam_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, exam_level: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="Graduate">Graduate</option>
                  <option value="Post Graduate">Post Graduate</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Certificate">Certificate</option>
                  <option value="All">All</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Total Questions *</label>
                <input
                  type="number"
                  value={formData.total_questions}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_questions: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Total Marks *</label>
                <input
                  type="number"
                  value={formData.total_marks}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_marks: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes) *</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty Level</label>
                <select
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty_level: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Very Hard">Very Hard</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the exam..."
              />
            </div>
          </div>

          {/* Exam Sections */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <BookOpen className="h-6 w-6 mr-3" />
                Exam Sections
              </h2>
              <button
                type="button"
                onClick={addSection}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Section</span>
              </button>
            </div>
            
            <div className="space-y-6">
              {formData.sections.map((section, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Section {index + 1}</h3>
                    {formData.sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Section Name *</label>
                      <input
                        type="text"
                        value={section.section_name}
                        onChange={(e) => updateSection(index, 'section_name', e.target.value)}
                        className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., General Knowledge"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Section Code *</label>
                      <input
                        type="text"
                        value={section.section_code}
                        onChange={(e) => updateSection(index, 'section_code', e.target.value)}
                        className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., GK, MATH, ENG"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Questions *</label>
                      <input
                        type="number"
                        value={section.questions}
                        onChange={(e) => updateSection(index, 'questions', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Marks per Question *</label>
                      <input
                        type="number"
                        step="0.25"
                        value={section.marks_per_question}
                        onChange={(e) => updateSection(index, 'marks_per_question', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        placeholder="e.g., 0.25, 1, 2.5"
                        required
                      />
                    </div>
                  </div>

                  {/* Topics for this section */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-medium text-white">Topics Covered</h4>
                      <button
                        type="button"
                        onClick={() => addTopic(index)}
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Topic</span>
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {section.topics.map((topic: Topic, topicIndex: number) => (
                        <div key={topicIndex} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={topic.topic_name}
                            onChange={(e) => updateTopic(index, topicIndex, 'topic_name', e.target.value)}
                            className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Topic name"
                          />
                          <input
                            type="number"
                            value={topic.weightage}
                            onChange={(e) => updateTopic(index, topicIndex, 'weightage', parseInt(e.target.value))}
                            className="w-20 px-2 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="%"
                            min="0"
                            max="100"
                          />
                          <select
                            value={topic.difficulty_level}
                            onChange={(e) => updateTopic(index, topicIndex, 'difficulty_level', e.target.value)}
                            className="px-2 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => removeTopic(index, topicIndex)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Question Types for this section */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-medium text-white">Question Types</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['MCQ', 'Fill in the Blanks', 'True/False', 'Short Answer', 'Long Answer', 'Numerical'].map((type) => (
                        <label key={type} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={section.question_types.includes(type)}
                            onChange={(e) => {
                              const newTypes = e.target.checked
                                ? [...section.question_types, type]
                                : section.question_types.filter(t => t !== type);
                              updateSection(index, 'question_types', newTypes);
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-300">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Marking Scheme */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Target className="h-6 w-6 mr-3" />
              Marking Scheme
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Marks for Correct Answer *</label>
                <input
                  type="number"
                  step="0.25"
                  value={formData.marking_scheme.correct_answer}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    marking_scheme: { ...prev.marking_scheme, correct_answer: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  placeholder="e.g., 0.25, 1, 2.5"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Marks for Wrong Answer *</label>
                <input
                  type="number"
                  step="0.25"
                  value={formData.marking_scheme.wrong_answer}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    marking_scheme: { ...prev.marking_scheme, wrong_answer: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 0, -0.25, -0.5"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={formData.marking_scheme.negative_marking}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    marking_scheme: { ...prev.marking_scheme, negative_marking: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-300">Negative Marking</label>
              </div>
              
              {formData.marking_scheme.negative_marking && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Negative Marking Value</label>
                  <input
                    type="number"
                    step="0.25"
                    value={formData.marking_scheme.negative_marking_value}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      marking_scheme: { ...prev.marking_scheme, negative_marking_value: parseFloat(e.target.value) }
                    }))}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    placeholder="e.g., 0.25, 0.5, 1"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Users className="h-6 w-6 mr-3" />
              Eligibility Criteria
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Age</label>
                <input
                  type="number"
                  value={formData.eligibility_criteria.age_limit.min}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    eligibility_criteria: { 
                      ...prev.eligibility_criteria, 
                      age_limit: { ...prev.eligibility_criteria.age_limit, min: parseInt(e.target.value) }
                    }
                  }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Age</label>
                <input
                  type="number"
                  value={formData.eligibility_criteria.age_limit.max}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    eligibility_criteria: { 
                      ...prev.eligibility_criteria, 
                      age_limit: { ...prev.eligibility_criteria.age_limit, max: parseInt(e.target.value) }
                    }
                  }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Education Qualification</label>
                <input
                  type="text"
                  value={formData.eligibility_criteria.education_qualification}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    eligibility_criteria: { ...prev.eligibility_criteria, education_qualification: e.target.value }
                  }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Bachelor's Degree"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nationality</label>
                <input
                  type="text"
                  value={formData.eligibility_criteria.nationality}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    eligibility_criteria: { ...prev.eligibility_criteria, nationality: e.target.value }
                  }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Indian"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Experience Required</label>
                <input
                  type="text"
                  value={formData.eligibility_criteria.experience_required}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    eligibility_criteria: { ...prev.eligibility_criteria, experience_required: e.target.value }
                  }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2 years experience"
                />
              </div>
            </div>
          </div>

          {/* Exam Details */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Calendar className="h-6 w-6 mr-3" />
              Exam Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Exam Frequency</label>
                <select
                  value={formData.exam_frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, exam_frequency: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Annual">Annual</option>
                  <option value="Bi-annual">Bi-annual</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="As per notification">As per notification</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Application Fee (₹)</label>
                <input
                  type="number"
                  value={formData.application_fee}
                  onChange={(e) => setFormData(prev => ({ ...prev, application_fee: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Exam Mode</label>
                <select
                  value={formData.exam_mode}
                  onChange={(e) => setFormData(prev => ({ ...prev, exam_mode: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Language Options</label>
                <input
                  type="text"
                  value={formData.language_options.join(', ')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    language_options: e.target.value.split(',').map(lang => lang.trim()).filter(lang => lang)
                  }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., English, Hindi, Tamil"
                />
              </div>
            </div>
          </div>

          {/* Preparation Strategy */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Brain className="h-6 w-6 mr-3" />
              Preparation Strategy
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Recommended Study Time</label>
                <input
                  type="text"
                  value={formData.preparation_strategy.recommended_study_time}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    preparation_strategy: { ...prev.preparation_strategy, recommended_study_time: e.target.value }
                  }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 6 months, 3 hours daily"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Important Topics</label>
                <div className="space-y-2">
                  {formData.preparation_strategy.important_topics.map((topic, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => {
                          const newTopics = [...formData.preparation_strategy.important_topics];
                          newTopics[index] = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            preparation_strategy: { ...prev.preparation_strategy, important_topics: newTopics }
                          }));
                        }}
                        className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter important topic"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newTopics = formData.preparation_strategy.important_topics.filter((_, i) => i !== index);
                          setFormData(prev => ({
                            ...prev,
                            preparation_strategy: { ...prev.preparation_strategy, important_topics: newTopics }
                          }));
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        preparation_strategy: { 
                          ...prev.preparation_strategy, 
                          important_topics: [...prev.preparation_strategy.important_topics, '']
                        }
                      }));
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Topic</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Practice Tips</label>
                <div className="space-y-2">
                  {formData.preparation_strategy.practice_tips.map((tip, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tip}
                        onChange={(e) => {
                          const newTips = [...formData.preparation_strategy.practice_tips];
                          newTips[index] = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            preparation_strategy: { ...prev.preparation_strategy, practice_tips: newTips }
                          }));
                        }}
                        className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter practice tip"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newTips = formData.preparation_strategy.practice_tips.filter((_, i) => i !== index);
                          setFormData(prev => ({
                            ...prev,
                            preparation_strategy: { ...prev.preparation_strategy, practice_tips: newTips }
                          }));
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        preparation_strategy: { 
                          ...prev.preparation_strategy, 
                          practice_tips: [...prev.preparation_strategy.practice_tips, '']
                        }
                      }));
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Tip</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Reference Books</label>
                <div className="space-y-2">
                  {formData.preparation_strategy.reference_books.map((book, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={book}
                        onChange={(e) => {
                          const newBooks = [...formData.preparation_strategy.reference_books];
                          newBooks[index] = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            preparation_strategy: { ...prev.preparation_strategy, reference_books: newBooks }
                          }));
                        }}
                        className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter reference book"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newBooks = formData.preparation_strategy.reference_books.filter((_, i) => i !== index);
                          setFormData(prev => ({
                            ...prev,
                            preparation_strategy: { ...prev.preparation_strategy, reference_books: newBooks }
                          }));
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        preparation_strategy: { 
                          ...prev.preparation_strategy, 
                          reference_books: [...prev.preparation_strategy.reference_books, '']
                        }
                      }));
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Book</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Online Resources</label>
                <div className="space-y-2">
                  {formData.preparation_strategy.online_resources.map((resource, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={resource}
                        onChange={(e) => {
                          const newResources = [...formData.preparation_strategy.online_resources];
                          newResources[index] = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            preparation_strategy: { ...prev.preparation_strategy, online_resources: newResources }
                          }));
                        }}
                        className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter online resource"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newResources = formData.preparation_strategy.online_resources.filter((_, i) => i !== index);
                          setFormData(prev => ({
                            ...prev,
                            preparation_strategy: { ...prev.preparation_strategy, online_resources: newResources }
                          }));
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        preparation_strategy: { 
                          ...prev.preparation_strategy, 
                          online_resources: [...prev.preparation_strategy.online_resources, '']
                        }
                      }));
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Resource</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Trophy className="h-6 w-6 mr-3" />
              Statistics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Success Rate</label>
                <input
                  type="text"
                  value={formData.success_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, success_rate: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 10-15%, 5-10%"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Average Score</label>
                <input
                  type="text"
                  value={formData.average_score}
                  onChange={(e) => setFormData(prev => ({ ...prev, average_score: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 60-70, 50-80"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Official Website</label>
                <input
                  type="url"
                  value={formData.exam_official_website}
                  onChange={(e) => setFormData(prev => ({ ...prev, exam_official_website: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Cutoff Marks</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">General</label>
                  <input
                    type="text"
                    value={formData.cutoff_marks.general}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cutoff_marks: { ...prev.cutoff_marks, general: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 120, 100-120"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">OBC</label>
                  <input
                    type="text"
                    value={formData.cutoff_marks.obc}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cutoff_marks: { ...prev.cutoff_marks, obc: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 115, 95-115"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">SC</label>
                  <input
                    type="text"
                    value={formData.cutoff_marks.sc}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cutoff_marks: { ...prev.cutoff_marks, sc: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 110, 90-110"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">ST</label>
                  <input
                    type="text"
                    value={formData.cutoff_marks.st}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cutoff_marks: { ...prev.cutoff_marks, st: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 105, 85-105"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Settings className="h-6 w-6 mr-3" />
              Additional Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Competition Level</label>
                <select
                  value={formData.competition_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, competition_level: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Very High">Very High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., government, competitive, entrance"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Exam Logo URL</label>
                <input
                  type="url"
                  value={formData.exam_logo}
                  onChange={(e) => setFormData(prev => ({ ...prev, exam_logo: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Exam Color</label>
                <input
                  type="color"
                  value={formData.exam_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, exam_color: e.target.value }))}
                  className="w-full h-12 px-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-300">Active</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-300">Featured</label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/manage-exam-patterns')}
              className="px-6 py-3 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Create Exam Pattern</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default CreateExamPattern;
