'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, AlertCircle, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react';
import dynamic from 'next/dynamic';
import axiosInstance from '@/utils/axiosInstance';
import { AxiosError } from 'axios';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(
  () => import('react-quill-new'),
  { 
    ssr: false,
    loading: () => <div className="h-[200px] bg-gray-50 rounded-lg animate-pulse" />
  }
);

interface Question {
  _id: number;
  question: string;
  answer: string;
  order: number;
}

function EditFAQ() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [formData, setFormData] = useState({
    topic_title: '',
    description: '',
    slug: '',
    questions: [{
      _id: 1,
      question: '',
      answer: '',
      order: 0
    }] as Question[],
    featured: false,
    is_active: true,
    tags: [] as string[]
  });
  const [nextQuestionId, setNextQuestionId] = useState(2);

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['code-block'],
      ['clean']
    ],
  };

  const quillFormats = ['header', 'bold', 'italic', 'underline', 'list', 'link', 'code-block'];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
      document.head.appendChild(link);
      
      return () => {
        const existingLink = document.querySelector('link[href="https://cdn.quilljs.com/1.3.6/quill.snow.css"]');
        if (existingLink) {
          existingLink.remove();
        }
      };
    }
  }, []);

  useEffect(() => {
    fetchFAQ();
  }, [id]);

  const fetchFAQ = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/faqs/admin/${id}`);
      const data = response.data;
      
      const sortedQuestions = data.questions && data.questions.length > 0 
        ? data.questions.sort((a: Question, b: Question) => (a.order || 0) - (b.order || 0))
        : [];

      const questionsWithIds = sortedQuestions.length > 0 
        ? sortedQuestions.map((q: any, index: number) => ({
            _id: index + 1,
            question: q.question || '',
            answer: q.answer || '',
            order: q.order !== undefined ? q.order : index
          }))
        : [{
            _id: 1,
            question: '',
            answer: '',
            order: 0
          }];

      setFormData({
        topic_title: data.topic_title || '',
        description: data.description || '',
        slug: data.slug || '',
        questions: questionsWithIds,
        featured: data.featured || false,
        is_active: data.is_active !== undefined ? data.is_active : true,
        tags: data.tags || []
      });
      setNextQuestionId(questionsWithIds.length + 1);
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      if (error instanceof AxiosError && error.response?.status === 404) {
        setError('FAQ not found');
      } else {
        setError('Failed to load FAQ');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!slugManuallyEdited && formData.topic_title) {
      const autoSlug = formData.topic_title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug: autoSlug }));
    }
  }, [formData.topic_title, slugManuallyEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    const validQuestions = formData.questions.filter(q => q.question.trim() && q.answer.trim());

    if (!formData.topic_title.trim() || !formData.slug.trim()) {
      setError('Topic title and slug are required');
      setSaving(false);
      return;
    }

    if (validQuestions.length === 0) {
      setError('At least one question with answer is required');
      setSaving(false);
      return;
    }

    try {
      await axiosInstance.put(`/api/faqs/admin/${id}`, {
        ...formData,
        questions: validQuestions.map((q, index) => ({
          question: q.question,
          answer: q.answer,
          order: index
        }))
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/manage-faqs');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update FAQ');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        _id: nextQuestionId,
        question: '',
        answer: '',
        order: prev.questions.length
      }]
    }));
    setNextQuestionId(prev => prev + 1);
  };

  const removeQuestion = (index: number) => {
    if (formData.questions.length > 1) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index).map((q, i) => ({
          ...q,
          order: i
        }))
      }));
    }
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formData.questions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...formData.questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIndex];
    newQuestions[targetIndex] = temp;
    
    newQuestions.forEach((q, i) => {
      q.order = i;
    });

    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const updateTag = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FAQ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        .ql-toolbar {
          background: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 6px 6px 0 0 !important;
        }
        .ql-container {
          border: 1px solid #e5e7eb !important;
          border-top: none !important;
          border-radius: 0 0 6px 6px !important;
          background: white !important;
        }
        .ql-editor {
          color: #111827 !important;
          font-size: 14px !important;
          min-height: 100px !important;
        }
        .ql-editor.ql-blank::before {
          color: #9ca3af !important;
        }
        .ql-editor pre.ql-syntax {
          background-color: #1e293b !important;
          color: #e2e8f0 !important;
          border-radius: 4px !important;
          padding: 12px !important;
          margin: 8px 0 !important;
          overflow-x: auto !important;
          font-family: 'Courier New', Courier, monospace !important;
          font-size: 13px !important;
          line-height: 1.5 !important;
        }
        .ql-editor code {
          background-color: #f1f5f9 !important;
          color: #e11d48 !important;
          padding: 2px 6px !important;
          border-radius: 3px !important;
          font-family: 'Courier New', Courier, monospace !important;
          font-size: 13px !important;
        }
      `}</style>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <button
          onClick={() => router.push('/admin/manage-faqs')}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-4 mt-20"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Edit FAQ</h2>
          <p className="text-sm text-gray-600">Update FAQ information</p>
        </div>

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span>FAQ updated successfully!</span>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic Title *</label>
              <input
                type="text"
                value={formData.topic_title}
                onChange={(e) => setFormData(prev => ({ ...prev, topic_title: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Python Programming FAQ"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug || ''}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  setFormData(prev => ({ ...prev, slug: e.target.value }));
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="python-programming-faq"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of this FAQ..."
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Active
              </label>
              
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Featured
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <button
                  type="button"
                  onClick={addTag}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Tag
                </button>
              </div>
              <div className="space-y-2">
                {formData.tags.map((tag, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => updateTag(i, e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter tag"
                    />
                    <button
                      type="button"
                      onClick={() => removeTag(i)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {formData.tags.length === 0 && (
                  <p className="text-xs text-gray-500">No tags added</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Questions & Answers</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Question
              </button>
            </div>

            <div className="space-y-4">
              {formData.questions.map((q, index) => (
                <div key={q._id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Question {index + 1}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveQuestion(index, 'up')}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveQuestion(index, 'down')}
                        disabled={index === formData.questions.length - 1}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      {formData.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Question *</label>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter question..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Answer *</label>
                    <ReactQuill
                      value={q.answer}
                      onChange={(content) => updateQuestion(index, 'answer', content)}
                      modules={quillModules}
                      formats={quillFormats}
                      theme="snow"
                      placeholder="Enter answer..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}

export default EditFAQ;

