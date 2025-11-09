'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';

function CreateProgrammingTopic() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    category: '',
    difficulty: 'Mixed',
    tags: [] as string[],
    featured: false,
    is_active: true
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!slugManuallyEdited && formData.title) {
      const autoSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug: autoSlug }));
    }
  }, [formData.title, slugManuallyEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!formData.title.trim() || !formData.slug.trim() || !formData.category.trim()) {
      setError('Title, slug, and category are required');
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post('/api/programming-topics/admin/create', formData);
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/manage-programming-topics');
      }, 1500);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to create programming topic');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white p-4 sm:p-6 mt-5">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Create Programming Topic</h1>
            <p className="text-gray-400 text-sm mt-1">Add a new programming topic with code questions</p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-500">Error</p>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-500">Success!</p>
              <p className="text-sm text-green-400">Topic created successfully. Redirecting...</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-[#161B33] rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0A0E27] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#6366F1]"
                  placeholder="e.g., Python Programs for Beginners"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData({ ...formData, slug: e.target.value });
                    setSlugManuallyEdited(true);
                  }}
                  className="w-full bg-[#0A0E27] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#6366F1] font-mono text-sm"
                  placeholder="python-programs-beginners"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">URL-friendly version (auto-generated from title)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0A0E27] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#6366F1] min-h-[100px]"
                  placeholder="Brief description of this programming topic..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#0A0E27] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#6366F1]"
                  placeholder="e.g., Python, DSA, Interview"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full bg-[#0A0E27] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#6366F1]"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tags Card */}
          <div className="bg-[#161B33] rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-4">Tags</h2>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 bg-[#0A0E27] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-[#6366F1]"
                  placeholder="Add a tag..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-[#6366F1] hover:bg-[#5558E3] rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-[#0A0E27] border border-gray-700 rounded-lg text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Settings Card */}
          <div className="bg-[#161B33] rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-700 bg-[#0A0E27] checked:bg-[#6366F1] focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-0"
                />
                <div>
                  <span className="font-medium">Featured</span>
                  <p className="text-sm text-gray-400">Show this topic in featured section</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-700 bg-[#0A0E27] checked:bg-[#6366F1] focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-0"
                />
                <div>
                  <span className="font-medium">Active</span>
                  <p className="text-sm text-gray-400">Make this topic publicly visible</p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-700 hover:bg-white/5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#6366F1] hover:bg-[#5558E3] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
            >
              {loading ? 'Creating...' : 'Create Topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProgrammingTopic;

