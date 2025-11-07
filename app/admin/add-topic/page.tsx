'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, BookOpen, Plus, Trash2, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
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

function AddTopics() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [topicName, setTopicName] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
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
    if (!topicName.trim()) {
      setError('Please enter a topic name');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axiosInstance.post('/api/topics/add', {
        topic_name: topicName.trim()
      });

      if (response.status === 201) {
        setSuccessMessage('Topic added successfully!');
        setTopicName('');
        fetchTopics(); // Refresh the topic list
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error: unknown) {
      console.error('Error adding topic:', error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to add topic. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (topicId: string, topicName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${topicName}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(topicId);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axiosInstance.delete(`/api/topics/delete/${topicId}`);
      
      if (response.status === 200) {
        setSuccessMessage('Topic deleted successfully!');
        fetchTopics(); // Refresh the topic list
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error: unknown) {
      console.error('Error deleting topic:', error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to delete topic. Please try again.');
      }
    } finally {
      setIsDeleting(null);
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
            <BookOpen className="h-8 w-8 mr-3" />
            Topic Management
          </h2>
          <p className="text-slate-300 text-lg">
            Add new topics and manage existing ones
          </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Topic Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add New Topic
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="topicName" className="block text-sm font-medium text-slate-300 mb-2">
                  Topic Name
                </label>
                <input
                  type="text"
                  id="topicName"
                  value={topicName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopicName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter topic name (e.g., Physics, Chemistry, Mathematics, etc.)"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
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
                    Add Topic
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Existing Topics List */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Existing Topics
            </h3>
            
            {loadingTopics ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                <p className="text-slate-300">Loading topics...</p>
              </div>
            ) : topics.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No topics added yet</p>
                <p className="text-slate-500 text-sm">Add your first topic using the form</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {topics.map((topic) => (
                  <div
                    key={topic._id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                       
                      <div>
                        <h4 className="text-white font-medium">{topic.topic_name}</h4>
                        
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(topic._id, topic.topic_name as string)}
                      disabled={isDeleting === topic._id}
                      className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/30 disabled:bg-red-600/10 text-red-200 disabled:text-red-400 px-3 py-2 rounded-lg transition-colors border border-red-500/30 disabled:border-red-500/20 disabled:cursor-not-allowed"
                    >
                      {isDeleting === topic._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                          <span className="text-sm">Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          <span className="text-sm">Delete</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AddTopics;