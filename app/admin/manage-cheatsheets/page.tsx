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
  FileText,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';

interface Cheatsheet {
  _id: string;
  title: string;
  description?: string;
  category: string;
  slug: string;
  views?: number;
  is_active?: boolean;
  featured?: boolean;
}

interface Stats {
  totalCheatsheets?: number;
  activeCheatsheets?: number;
  featuredCheatsheets?: number;
  categoryStats?: any[];
}

function ManageCheatsheets() {
  const [cheatsheets, setCheatsheets] = useState<Cheatsheet[]>([]);
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
    fetchCheatsheets();
    fetchStats();
  }, [filters, pagination.current]);

  const fetchCheatsheets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', pagination.current.toString());
      params.append('limit', '10');
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);

      const response = await axiosInstance.get(`/api/cheatsheets/admin/all?${params}`);
      setCheatsheets(response.data.cheatsheets);
      setPagination(response.data.pagination);
    } catch (error) {
      setError('Failed to load cheatsheets');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/api/cheatsheets/admin/stats');
      setStats(response.data);
    } catch (error) {
    }
  };

  const handleCreate = () => {
    router.push('/admin/create-cheatsheet');
  };

  const handleEdit = (cheatsheet: Cheatsheet) => {
    router.push(`/admin/edit-cheatsheet/${cheatsheet._id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this cheatsheet?')) {
      try {
        await axiosInstance.delete(`/api/cheatsheets/admin/${id}`);
        fetchCheatsheets();
        fetchStats();
      } catch (error) {
        setError('Failed to delete cheatsheet');
      }
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      await axiosInstance.patch(`/api/cheatsheets/admin/${id}/featured`, {
        featured: !currentStatus
      });
      fetchCheatsheets();
    } catch (error) {
    }
  };

  if (loading && cheatsheets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading cheatsheets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex md:items-center md:justify-between  p-5 flex-col md:flex-row gap-4 md:gap-0">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="p-2 text-white hover:text-blue-300 hover:bg-white/10 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-slate-900" />
              </div>
              <h1 className="text-xl font-bold text-white">Manage Cheatsheets</h1>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 font-semibold px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              <span>Add Cheatsheet</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total</p>
                <p className="text-2xl font-bold text-white">{stats.totalCheatsheets || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Active</p>
                <p className="text-2xl font-bold text-white">{stats.activeCheatsheets || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Star className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Featured</p>
                <p className="text-2xl font-bold text-white">{stats.featuredCheatsheets || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Categories</p>
                <p className="text-2xl font-bold text-white">{stats.categoryStats?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cheatsheets..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="Programming">Programming</option>
                <option value="Web Development">Web Development</option>
                <option value="Data Science">Data Science</option>
                <option value="DevOps">DevOps</option>
                <option value="Database">Database</option>
                <option value="Algorithms">Algorithms</option>
                <option value="Linux">Linux</option>
                <option value="Git">Git</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cheatsheets Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Views</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {cheatsheets.map((cheatsheet) => (
                  <tr key={cheatsheet._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="bg-blue-500/20 rounded-full p-2 mr-3">
                          <FileText className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{cheatsheet.title}</div>
                          {cheatsheet.description && (
                            <div className="text-sm text-gray-300 truncate max-w-xs">{cheatsheet.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                        {cheatsheet.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 font-mono">{cheatsheet.slug}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{cheatsheet.views || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          cheatsheet.is_active 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {cheatsheet.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {cheatsheet.featured && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(cheatsheet)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(cheatsheet._id, cheatsheet.featured || false)}
                          className={`p-2 rounded-lg transition-colors ${
                            cheatsheet.featured 
                              ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20' 
                              : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/20'
                          }`}
                          title={cheatsheet.featured ? 'Remove from featured' : 'Add to featured'}
                        >
                          {cheatsheet.featured ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(cheatsheet._id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-300">
            Showing {cheatsheets.length} of {pagination.total} cheatsheets
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              {pagination.current} of {pagination.total}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
              disabled={!pagination.hasNext}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ManageCheatsheets;

