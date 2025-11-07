'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, BookOpen, Plus, ArrowLeft, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import { AxiosError } from 'axios';

interface UserData {
  username: string;
  [key: string]: any;
}

interface Topic {
  _id: string;
  topic_name: string;
}

function AddSubtopics() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subtopicName, setSubtopicName] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingTopics, setLoadingTopics] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
    fetchTopics();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/profile');
      if (response.status === 200 && response.data && response.data.username) {
        setUser(response.data);
        setError('');
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      if (error instanceof AxiosError && error.response?.status === 401) {
        router.push('/admin/login');
      } else {
        setError('Failed to load user data. Please try refreshing the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    setLoadingTopics(true);
    try {
      const response = await axiosInstance.get('/api/topics/all');
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setError('Failed to load topics');
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
      setUser(null);
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      router.push('/admin/login');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!subtopicName.trim()) {
      setError('Please enter a subtopic name');
      return;
    }

    if (!selectedTopicId) {
      setError('Please select a topic');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axiosInstance.post('/api/subtopics/add', {
        subtopic_name: subtopicName.trim(),
        topic_id: selectedTopicId
      });

      if (response.status === 201) {
        setSuccessMessage('Subtopic added successfully!');
        setSubtopicName('');
        setSelectedTopicId('');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error adding subtopic:', error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to add subtopic. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-slate-900" />
              </div>
              <h1 className="text-xl font-bold text-white">PariksakHub</h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <User className="h-5 w-5" />
                <span className="font-medium">Welcome, {user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium border border-red-500"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
 

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-500/20 border border-green-500/50 text-green-200 px-6 py-4 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Add Subtopic Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add New Subtopic
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Topic Selection */}
            <div>
              <label htmlFor="topicSelect" className="block text-sm font-medium text-slate-300 mb-2">
                Select Topic
              </label>
              {loadingTopics ? (
                <div className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500 mr-2"></div>
                  <span className="text-slate-400">Loading topics...</span>
                </div>
              ) : (
                <div className="relative">
                  <select
                    id="topicSelect"
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none cursor-pointer"
                    required
                  >
                    <option value="" className="bg-slate-800 text-slate-300">
                      Choose a topic...
                    </option>
                    {topics.map((topic) => (
                      <option 
                        key={topic._id} 
                        value={topic._id} 
                        className="bg-slate-800 text-white"
                      >
                        {topic.topic_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>
              )}
              {topics.length === 0 && !loadingTopics && (
                <p className="text-slate-400 text-sm mt-1">
                  No topics available. Please add topics first.
                </p>
              )}
            </div>

            {/* Subtopic Name Input */}
            <div>
              <label htmlFor="subtopicName" className="block text-sm font-medium text-slate-300 mb-2">
                Subtopic Name
              </label>
              <input
                type="text"
                id="subtopicName"
                value={subtopicName}
                onChange={(e) => setSubtopicName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Enter subtopic name (e.g., Thermodynamics, Organic Chemistry, Calculus, etc.)"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || topics.length === 0}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-600 disabled:to-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subtopic
                </>
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-200 text-sm">
              <strong>Note:</strong> Make sure to add topics first before creating subtopics. 
              Subtopics help organize content within broader topic areas.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AddSubtopics;