'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, BookOpen, Trash2, ArrowLeft, AlertCircle, CheckCircle, ChevronDown, Filter } from 'lucide-react';
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

interface Subtopic {
  _id: string;
  subtopic_name: string;
  topic_name: string;
}

function ManageSubTopics() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedTopicName, setSelectedTopicName] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingSubtopics, setLoadingSubtopics] = useState(false);
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

  const fetchSubtopics = async (topicId: string) => {
    if (!topicId) {
      setSubtopics([]);
      return;
    }

    setLoadingSubtopics(true);
    setError('');
    try {
      const response = await axiosInstance.get(`/api/subtopics/topic/${topicId}`);
      setSubtopics(response.data);
    } catch (error) {
      console.error('Error fetching subtopics:', error);
      setError('Failed to load subtopics');
      setSubtopics([]);
    } finally {
      setLoadingSubtopics(false);
    }
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const topicId = e.target.value;
    setSelectedTopicId(topicId);
    
    if (topicId) {
      const selectedTopic = topics.find(topic => topic._id === topicId);
      setSelectedTopicName(selectedTopic ? selectedTopic.topic_name : '');
      fetchSubtopics(topicId);
    } else {
      setSelectedTopicName('');
      setSubtopics([]);
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

  const handleDelete = async (subtopicId: string, subtopicName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${subtopicName}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(subtopicId);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axiosInstance.delete(`/api/subtopics/delete/${subtopicId}`);
      
      if (response.status === 200) {
        setSuccessMessage('Subtopic deleted successfully!');
        fetchSubtopics(selectedTopicId); // Refresh the subtopics list
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error: unknown) {
      console.error('Error deleting subtopic:', error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to delete subtopic. Please try again.');
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
            Manage Subtopics
          </h2>
          <p className="text-slate-300 text-lg">
            View and manage subtopics for each topic
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

        {/* Topic Filter */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter by Topic
          </h3>
          
          <div className="max-w-md">
            <label htmlFor="topicFilter" className="block text-sm font-medium text-slate-300 mb-2">
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
                  id="topicFilter"
                  value={selectedTopicId}
                  onChange={handleTopicChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-800 text-slate-300">
                    All Topics - Select to filter
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
          </div>
        </div>

        {/* Subtopics List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            {selectedTopicName ? `Subtopics for ${selectedTopicName}` : 'Subtopics'}
          </h3>
          
          {!selectedTopicId ? (
            <div className="text-center py-12">
              <Filter className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-2">Select a topic to view subtopics</p>
              <p className="text-slate-500 text-sm">Use the filter above to choose a topic</p>
            </div>
          ) : loadingSubtopics ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-slate-300 text-lg">Loading subtopics...</p>
            </div>
          ) : subtopics.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-2">No subtopics found for {selectedTopicName}</p>
              <p className="text-slate-500 text-sm">Add subtopics to this topic to see them here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subtopics.map((subtopic) => (
                <div
                  key={subtopic._id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{subtopic.subtopic_name}</h4>
                      <p className="text-slate-400 text-sm">Topic: {selectedTopicName}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(subtopic._id, subtopic.subtopic_name)}
                    disabled={isDeleting === subtopic._id}
                    className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/30 disabled:bg-red-600/10 text-red-200 disabled:text-red-400 px-3 py-2 rounded-lg transition-colors border border-red-500/30 disabled:border-red-500/20 disabled:cursor-not-allowed"
                  >
                    {isDeleting === subtopic._id ? (
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

        {/* Info Panel */}
        {topics.length === 0 && !loadingTopics && (
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-200 text-sm">
              <strong>No topics available:</strong> Please add topics first before managing subtopics.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default ManageSubTopics;