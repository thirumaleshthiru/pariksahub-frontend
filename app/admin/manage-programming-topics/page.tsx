'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  StarOff, 
  Search, 
  ArrowLeft,
  Code,
  CheckCircle,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';

interface ProgrammingTopic {
  _id: string;
  title: string;
  description?: string;
  slug: string;
  category: string;
  difficulty?: string;
  is_active?: boolean;
  featured?: boolean;
  question_count?: number;
}

interface Stats {
  totalTopics?: number;
  activeTopics?: number;
  featuredTopics?: number;
  totalQuestions?: number;
}

function ManageProgrammingTopics() {
  const [topics, setTopics] = useState<ProgrammingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Stats>({});
  const [filters, setFilters] = useState({
    search: '',
    category: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    hasNext: false,
    hasPrev: false
  });
  const router = useRouter();

  useEffect(() => {
    fetchTopics();
    fetchStats();
  }, [filters, pagination.current]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', pagination.current.toString());
      params.append('limit', '10');
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);

      const response = await axiosInstance.get(`/api/programming-topics/admin/all?${params}`);
      setTopics(response.data.topics);
      setPagination(response.data.pagination);
    } catch (error) {
      setError('Failed to load programming topics');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/api/programming-topics/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleCreate = () => {
    router.push('/admin/create-programming-topic');
  };

  const handleEdit = (topic: ProgrammingTopic) => {
    router.push(`/admin/edit-programming-topic/${topic._id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this topic? This will also delete all associated questions.')) {
      try {
        await axiosInstance.delete(`/api/programming-topics/admin/${id}`);
        fetchTopics();
        fetchStats();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Failed to delete topic');
      }
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      await axiosInstance.patch(`/api/programming-topics/admin/${id}/featured`);
      fetchTopics();
      fetchStats();
    } catch (error) {
      alert('Failed to toggle featured status');
    }
  };

  const handleViewQuestions = (topicId: string) => {
    router.push(`/admin/manage-code-questions?topicId=${topicId}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white p-4 sm:p-6 mt-5">
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
              <h1 className="text-2xl sm:text-3xl font-bold">Manage Programming Topics</h1>
              <p className="text-gray-400 text-sm mt-1">Manage programming topics and their code questions</p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-[#6366F1] hover:bg-[#5558E3] rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Create Topic</span>
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#161B33] rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-[#6366F1]" />
                <span className="text-sm text-gray-400">Total Topics</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalTopics || 0}</p>
            </div>
            <div className="bg-[#161B33] rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-400">Active</span>
              </div>
              <p className="text-2xl font-bold">{stats.activeTopics || 0}</p>
            </div>
            <div className="bg-[#161B33] rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-400">Featured</span>
              </div>
              <p className="text-2xl font-bold">{stats.featuredTopics || 0}</p>
            </div>
            <div className="bg-[#161B33] rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-400">Questions</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalQuestions || 0}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-[#161B33] rounded-xl border border-gray-800 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setPagination({ ...pagination, current: 1 });
                }}
                placeholder="Search topics..."
                className="w-full pl-10 pr-4 py-2 bg-[#0A0E27] border border-gray-700 rounded-lg focus:outline-none focus:border-[#6366F1]"
              />
            </div>
            <input
              type="text"
              value={filters.category}
              onChange={(e) => {
                setFilters({ ...filters, category: e.target.value });
                setPagination({ ...pagination, current: 1 });
              }}
              placeholder="Filter by category..."
              className="w-full sm:w-48 px-4 py-2 bg-[#0A0E27] border border-gray-700 rounded-lg focus:outline-none focus:border-[#6366F1]"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Topics List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]"></div>
            <p className="mt-4 text-gray-400">Loading topics...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-12 bg-[#161B33] rounded-xl border border-gray-800">
            <p className="text-gray-400">No topics found</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {topics.map((topic) => (
                <div
                  key={topic._id}
                  className="bg-[#161B33] rounded-xl border border-gray-800 p-4 sm:p-6 hover:border-[#6366F1] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <h3 className="text-lg font-bold">{topic.title}</h3>
                        {topic.featured && (
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        )}
                        {!topic.is_active && (
                          <span className="px-2 py-1 text-xs bg-gray-700 rounded">Inactive</span>
                        )}
                      </div>
                      {topic.description && (
                        <p className="text-sm text-gray-400 mb-2 line-clamp-2">{topic.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-[#0A0E27] border border-gray-700 rounded">
                          {topic.category}
                        </span>
                        {topic.difficulty && (
                          <span className="px-2 py-1 bg-[#0A0E27] border border-gray-700 rounded">
                            {topic.difficulty}
                          </span>
                        )}
                        <span className="px-2 py-1 bg-[#0A0E27] border border-gray-700 rounded">
                          {topic.question_count || 0} questions
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewQuestions(topic._id)}
                        className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg transition-colors text-sm flex items-center gap-2"
                      >
                        <Code className="w-4 h-4" />
                        Questions
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(topic._id, topic.featured || false)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title={topic.featured ? 'Unfeature' : 'Feature'}
                      >
                        {topic.featured ? (
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <StarOff className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(topic)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5 text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(topic._id)}
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

export default ManageProgrammingTopics;

