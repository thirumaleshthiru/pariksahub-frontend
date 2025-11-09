'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  ArrowLeft,
  Code,
  BarChart3,
  AlertCircle,
  Filter
} from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';

interface CodeQuestion {
  _id: string;
  topic_id: {
    _id: string;
    title: string;
    slug: string;
    category: string;
  };
  title: string;
  description?: string;
  difficulty?: string;
  content_blocks?: Array<{
    type: 'code' | 'text';
    code?: string;
    language?: string;
    text_content?: string;
  }>;
  order?: number;
  is_active?: boolean;
}

interface ProgrammingTopic {
  _id: string;
  title: string;
  category: string;
}

interface Stats {
  totalQuestions?: number;
  activeQuestions?: number;
  byDifficulty?: Array<{ _id: string; count: number }>;
}

function ManageCodeQuestionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicIdParam = searchParams.get('topicId');
  
  const [questions, setQuestions] = useState<CodeQuestion[]>([]);
  const [topics, setTopics] = useState<ProgrammingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Stats>({});
  const [filters, setFilters] = useState({
    search: '',
    topicId: topicIdParam || '',
    difficulty: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    fetchQuestions();
    fetchTopics();
    fetchStats();
  }, [filters, pagination.current]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', pagination.current.toString());
      params.append('limit', '10');
      if (filters.search) params.append('search', filters.search);
      if (filters.topicId) params.append('topicId', filters.topicId);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);

      const response = await axiosInstance.get(`/api/code-questions/admin/all?${params}`);
      setQuestions(response.data.questions);
      setPagination(response.data.pagination);
    } catch (error) {
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await axiosInstance.get('/api/programming-topics/admin/all?limit=100');
      setTopics(response.data.topics || []);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/api/code-questions/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleCreate = () => {
    const url = filters.topicId 
      ? `/admin/add-code-question?topicId=${filters.topicId}`
      : '/admin/add-code-question';
    router.push(url);
  };

  const handleEdit = (question: CodeQuestion) => {
    router.push(`/admin/edit-code-question/${question._id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await axiosInstance.delete(`/api/code-questions/admin/${id}`);
        fetchQuestions();
        fetchStats();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Failed to delete question');
      }
    }
  };

  const getCodeBlockCount = (question: CodeQuestion) => {
    return question.content_blocks?.filter(b => b.type === 'code').length || 0;
  };

  const getTextBlockCount = (question: CodeQuestion) => {
    return question.content_blocks?.filter(b => b.type === 'text').length || 0;
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white p-4 sm:p-6 mt-5">
      <style>{`
        .prose-custom {
          color: rgba(156, 163, 175, 1);
        }
        .prose-custom h1,
        .prose-custom h2,
        .prose-custom h3 {
          font-weight: 700;
          color: #ffffff;
          margin: 0.5rem 0;
          font-size: 1rem;
        }
        .prose-custom h2 {
          font-size: 1.125rem;
        }
        .prose-custom h3 {
          font-size: 1rem;
        }
        .prose-custom p {
          margin: 0.5rem 0;
          line-height: 1.5;
        }
        .prose-custom strong {
          font-weight: 600;
          color: #ffffff;
        }
        .prose-custom ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .prose-custom ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .prose-custom li {
          margin: 0.25rem 0;
          display: list-item;
        }
        .prose-custom .ql-code-block-container {
          background: #1f2937;
          border-radius: 0.375rem;
          padding: 0.5rem;
          margin: 0.5rem 0;
          font-family: 'Courier New', monospace;
        }
        .prose-custom .ql-code-block {
          color: #e5e7eb;
          font-size: 0.875rem;
          line-height: 1.5;
          white-space: pre-wrap;
        }
        .prose-custom code {
          background: #374151;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          color: #fbbf24;
          font-size: 0.875rem;
        }
        .prose-custom pre {
          background: #1f2937;
          padding: 0.75rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          margin: 0.5rem 0;
        }
        .prose-custom .ql-ui {
          display: none;
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Manage Code Questions</h1>
              <p className="text-gray-400 text-sm mt-1">Manage code questions with multiple code blocks and explanations</p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-[#6366F1] hover:bg-[#5558E3] rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Question</span>
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#161B33] rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-[#6366F1]" />
                <span className="text-sm text-gray-400">Total</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalQuestions || 0}</p>
            </div>
            <div className="bg-[#161B33] rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-400">Active</span>
              </div>
              <p className="text-2xl font-bold">{stats.activeQuestions || 0}</p>
            </div>
            {stats.byDifficulty && stats.byDifficulty.map((diff) => (
              <div key={diff._id} className="bg-[#161B33] rounded-xl border border-gray-800 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-400">{diff._id || 'Unknown'}</span>
                </div>
                <p className="text-2xl font-bold">{diff.count}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-[#161B33] rounded-xl border border-gray-800 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setPagination({ ...pagination, current: 1 });
                }}
                placeholder="Search questions..."
                className="w-full pl-10 pr-4 py-2 bg-[#0A0E27] border border-gray-700 rounded-lg focus:outline-none focus:border-[#6366F1]"
              />
            </div>
            <select
              value={filters.topicId}
              onChange={(e) => {
                setFilters({ ...filters, topicId: e.target.value });
                setPagination({ ...pagination, current: 1 });
              }}
              className="w-full px-4 py-2 bg-[#0A0E27] border border-gray-700 rounded-lg focus:outline-none focus:border-[#6366F1]"
            >
              <option value="">All Topics</option>
              {topics.map(topic => (
                <option key={topic._id} value={topic._id}>{topic.title}</option>
              ))}
            </select>
            <select
              value={filters.difficulty}
              onChange={(e) => {
                setFilters({ ...filters, difficulty: e.target.value });
                setPagination({ ...pagination, current: 1 });
              }}
              className="w-full px-4 py-2 bg-[#0A0E27] border border-gray-700 rounded-lg focus:outline-none focus:border-[#6366F1]"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Questions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]"></div>
            <p className="mt-4 text-gray-400">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 bg-[#161B33] rounded-xl border border-gray-800">
            <p className="text-gray-400">No questions found</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {questions.map((question) => (
                <div
                  key={question._id}
                  className="bg-[#161B33] rounded-xl border border-gray-800 p-4 sm:p-6 hover:border-[#6366F1] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <h3 className="text-lg font-bold">{question.title}</h3>
                        {!question.is_active && (
                          <span className="px-2 py-1 text-xs bg-gray-700 rounded">Inactive</span>
                        )}
                      </div>
                      {question.description && (
                        <div 
                          className="text-sm text-gray-400 mb-2 line-clamp-3 prose-custom"
                          dangerouslySetInnerHTML={{ __html: question.description }}
                        />
                      )}
                      <div className="flex flex-wrap gap-2 text-xs mb-2">
                        <span className="px-2 py-1 bg-[#0A0E27] border border-gray-700 rounded">
                          {question.topic_id?.title || 'Unknown Topic'}
                        </span>
                        {question.difficulty && (
                          <span className="px-2 py-1 bg-[#0A0E27] border border-gray-700 rounded">
                            {question.difficulty}
                          </span>
                        )}
                        <span className="px-2 py-1 bg-[#0A0E27] border border-gray-700 rounded">
                          {getCodeBlockCount(question)} code block(s)
                        </span>
                        <span className="px-2 py-1 bg-[#0A0E27] border border-gray-700 rounded">
                          {getTextBlockCount(question)} text block(s)
                        </span>
                        {question.order !== undefined && (
                          <span className="px-2 py-1 bg-[#0A0E27] border border-gray-700 rounded">
                            Order: {question.order}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(question)}
                        className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg transition-colors text-sm flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(question._id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 bg-[#161B33] border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#6366F1] transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm">
                  Page {pagination.current} of {pagination.total}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 bg-[#161B33] border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#6366F1] transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ManageCodeQuestions() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0E27] text-white p-4 sm:p-6 mt-5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366F1] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ManageCodeQuestionsContent />
    </Suspense>
  );
}

export default ManageCodeQuestions;

