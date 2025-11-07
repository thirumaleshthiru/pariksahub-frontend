import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, BookOpen, Trophy, Clock, Settings, Plus, List, Edit, Zap } from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import { AxiosError } from 'axios';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();


  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/profile')
      console.log('Profile response:', response.data); // Debug log
      
      // Check if response is successful and has username
      if (response.status === 200 && response.data && response.data.username) {
        setUser(response.data);
        setError(''); // Clear any previous errors
      } else {
        console.log('No valid user data received');
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      
      // Check if it's a 401 (unauthorized) error
      if (error instanceof AxiosError && error.response?.status === 401) {
        console.log('Unauthorized - redirecting to login');
        router.push('/login');
      } else {
        // For other errors, show error message but don't redirect immediately
        setError('Failed to load user data. Please try refreshing the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout')
      // Clear any stored user data
      setUser(null);
      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear user data and redirect
      setUser(null);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-lg mb-4">
            <p className="text-lg font-semibold mb-2">Error</p>
            <p>{error}</p>
          </div>
          <button
            onClick={checkAuthStatus}
            className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold py-2 px-4 rounded-lg transition-colors mr-4"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // If no user data, show loading or redirect
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
      <header className=" mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex md:items-center justify-between h-16 md:flex-row flex-col">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-white">PariksakHub</h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
 
                <span className="font-medium">Welcome, {user.username as string || ''}</span>
              </div>
             
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.username as string || ''}!
          </h2>
          <p className="text-slate-300 text-lg">
            Manage your exam content and questions
          </p>
        </div>

       

        {/* Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Exam Management */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Exam Management
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/add-exam')}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Exam
              </button>
            </div>
          </div>

          {/* Topic Management */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Topic Management
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/add-topic')}
                className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 font-semibold py-3 px-4 rounded-lg transition-all duration-300 border border-blue-500/30 flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Topic
              </button>
            </div>
          </div>

          {/* Subtopic Management */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Subtopic Management
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/add-subtopic')}
                className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 font-semibold py-3 px-4 rounded-lg transition-all duration-300 border border-purple-500/30 flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Subtopic
              </button>
              <button 
                onClick={() => router.push('/manage-subtopics')}
                className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 font-semibold py-3 px-4 rounded-lg transition-all duration-300 border border-purple-500/30 flex items-center justify-center"
              >
                <List className="h-4 w-4 mr-2" />
                Manage Subtopics
              </button>
            </div>
          </div>

          {/* Question Management */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Edit className="h-5 w-5 mr-2" />
              Question Management
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/add-question')}
                className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-200 font-semibold py-3 px-4 rounded-lg transition-all duration-300 border border-green-500/30 flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </button>
              <button 
                onClick={() => router.push('/manage-questions')}
                className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-200 font-semibold py-3 px-4 rounded-lg transition-all duration-300 border border-green-500/30 flex items-center justify-center"
              >
                <List className="h-4 w-4 mr-2" />
                Manage Questions
              </button>
            </div>
          </div>

          {/* Exam Pattern Management */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Exam Pattern Management
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/create-exam-pattern')}
                className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 font-semibold py-3 px-4 rounded-lg transition-all duration-300 border border-indigo-500/30 flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Exam Pattern
              </button>
              <button 
                onClick={() => router.push('/manage-exam-patterns')}
                className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 font-semibold py-3 px-4 rounded-lg transition-all duration-300 border border-indigo-500/30 flex items-center justify-center"
              >
                <List className="h-4 w-4 mr-2" />
                Manage Exam Patterns
              </button>
            </div>
          </div>

          {/* Cheatsheet Management */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Cheatsheet Management
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/create-cheatsheet')}
                className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 font-semibold py-3 px-4 rounded-lg transition-all duration-300 border border-orange-500/30 flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Cheatsheet
              </button>
              <button 
                        onClick={() => router.push('/manage-cheatsheets')}
                className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 font-semibold py-3 px-4 rounded-lg transition-all duration-300 border border-orange-500/30 flex items-center justify-center"
              >
                <List className="h-4 w-4 mr-2" />
                Manage Cheatsheets
              </button>
            </div>
          </div>
        </div>
      </div>
      </header>
    </div>
    </div>
  );
}
export default Dashboard;