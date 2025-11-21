'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  BookOpen, 
  TrendingUp, 
  LogOut
} from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import Link from 'next/link';
import FloatingNotes from '@/components/FloatingNotes';

interface TestResult {
  subTopicName: string;
  score: {
    correct: number;
    total: number;
    answered: number;
    percentage: number;
  };
  completedAt: string;
}

interface VisitedTopic {
  topicName: string;
  subTopicName?: string;
  visitedAt: string;
}

interface DashboardData {
  username: string;
  email: string;
  savedQuestions: any[];
  testResults: TestResult[];
  visitedTopics: VisitedTopic[];
  stats: {
    totalSavedQuestions: number;
    totalTestsCompleted: number;
    totalTopicsVisited: number;
    averageTestScore: number;
  };
}

function StudentDashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/student/dashboard');
      setDashboardData(response.data);
      setError(null);
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/student/login');
      } else {
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/student/logout');
      
      // Dispatch event to update navbar
      window.dispatchEvent(new Event('studentAuthChange'));
      
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still dispatch event even if logout fails
      window.dispatchEvent(new Event('studentAuthChange'));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error || 'Failed to load dashboard'}</p>
          <button
            onClick={fetchDashboard}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      <div className='hidden md:block'><FloatingNotes /></div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Student Dashboard</h1>
            <p className="text-gray-400">Welcome back, {dashboardData.username}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#161B33] rounded-xl border border-gray-800 p-6">
            <p className="text-gray-400 text-sm mb-1">Saved Questions</p>
            <p className="text-3xl font-bold text-white">{dashboardData.stats.totalSavedQuestions}</p>
          </div>

          <div className="bg-[#161B33] rounded-xl border border-gray-800 p-6">
            <p className="text-gray-400 text-sm mb-1">Tests Completed</p>
            <p className="text-3xl font-bold text-white">{dashboardData.stats.totalTestsCompleted}</p>
          </div>

          <div className="bg-[#161B33] rounded-xl border border-gray-800 p-6">
            <p className="text-gray-400 text-sm mb-1">Topics Visited</p>
            <p className="text-3xl font-bold text-white">{dashboardData.stats.totalTopicsVisited}</p>
          </div>

          <div className="bg-[#161B33] rounded-xl border border-gray-800 p-6">
            <p className="text-gray-400 text-sm mb-1">Average Score</p>
            <p className="text-3xl font-bold text-white">{dashboardData.stats.averageTestScore}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Results */}
          <div className="bg-[#161B33] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Test Results</h2>
            </div>
            {dashboardData.testResults.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No test results yet</p>
                <Link
                  href="/test-topics"
                  className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Take a Mock Test
                </Link>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {dashboardData.testResults.slice(0, 10).map((result, index) => (
                  <div
                    key={index}
                    className="bg-[#0A0E27] rounded-lg border border-gray-800 p-4 hover:border-indigo-500 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-white font-semibold">{result.subTopicName}</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          {formatDate(result.completedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-400">{result.score.percentage}%</p>
                        <p className="text-gray-400 text-sm">
                          {result.score.correct}/{result.score.total} correct
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{result.score.answered}/{result.score.total} answered</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all"
                          style={{ width: `${(result.score.answered / result.score.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visited Topics */}
          <div className="bg-[#161B33] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recently Visited Topics</h2>
            </div>
            {dashboardData.visitedTopics.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No topics visited yet</p>
                <Link
                  href="/practice"
                  className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Start Practicing
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dashboardData.visitedTopics.slice(0, 15).map((topic, index) => (
                  <Link
                    key={index}
                    href={`/practice/${topic.topicName.toLowerCase().replace(/\s+/g, '-')}${topic.subTopicName ? `/${topic.subTopicName.toLowerCase().replace(/\s+/g, '-')}` : ''}`}
                    className="block bg-[#0A0E27] rounded-lg border border-gray-800 p-4 hover:border-green-500 transition"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-semibold">{topic.topicName}</h3>
                        {topic.subTopicName && (
                          <p className="text-gray-400 text-sm">{topic.subTopicName}</p>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs">
                        {formatDate(topic.visitedAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Saved Questions Preview */}
        <div className="mt-8 bg-[#161B33] rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Saved Questions</h2>
            {dashboardData.savedQuestions.length > 0 && (
              <Link
                href="/saved"
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
              >
                View All
              </Link>
            )}
          </div>
          {dashboardData.savedQuestions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No saved questions yet</p>
              <Link
                href="/practice"
                className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Start Practicing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.savedQuestions.slice(0, 6).map((item: any, index: number) => (
                <Link
                  key={item.question._id}
                  href="/saved"
                  className="bg-[#0A0E27] rounded-lg border border-gray-800 p-4 hover:border-indigo-500 transition"
                >
                  <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">
                    Question {index + 1}
                  </h3>
                  <div
                    className="text-gray-400 text-xs line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: item.question.question }}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;

