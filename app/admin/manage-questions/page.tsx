'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  LogOut, 
  BookOpen, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  ChevronDown, 
  Search,
  Edit,
  Trash2,
  Filter,
  RefreshCw,
  ImageIcon,
  FileText
} from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import { AxiosError } from 'axios';

interface UserData {
  username: string;
  [key: string]: any;
}

interface QuestionData {
  _id: string;
  question: string;
  question_type: string;
  question_image_url?: string;
  answer?: string;
}

interface Question {
  _id: string;
  question: QuestionData;
  subtopic: {
    subtopic_name: string;
    topic_name: string;
  };
  options?: any[];
  [key: string]: any;
}

interface Subtopic {
  _id: string;
  subtopic_name: string;
  topic_name: string;
}

interface Exam {
  _id: string;
  exam_name: string;
}

function ManageQuestions() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [questionsLoading, setQuestionsLoading] = useState(false);
  
  // Filter states
  const [selectedSubtopicId, setSelectedSubtopicId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'subtopic', 'exam', 'both'
  
  // Data states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingSubtopics, setLoadingSubtopics] = useState(false);
  const [loadingExams, setLoadingExams] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(10);
  
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
    fetchSubtopics();
    fetchExams();
  }, []);

  useEffect(() => {
    if (filterType !== 'all') {
      fetchQuestions();
    }
  }, [selectedSubtopicId, selectedExamId, filterType]);

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

  const fetchSubtopics = async () => {
    setLoadingSubtopics(true);
    try {
      const response = await axiosInstance.get('/api/subtopics/all');
      setSubtopics(response.data);
    } catch (error) {
      console.error('Error fetching subtopics:', error);
      setError('Failed to load subtopics');
    } finally {
      setLoadingSubtopics(false);
    }
  };

  const fetchExams = async () => {
    setLoadingExams(true);
    try {
      const response = await axiosInstance.get('/api/exams/all');
      setExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setError('Failed to load exams');
    } finally {
      setLoadingExams(false);
    }
  };

  const fetchQuestions = async () => {
    if (filterType === 'all') {
      setQuestions([]);
      return;
    }

    setQuestionsLoading(true);
    setError('');
    
  try {
  let endpoint = '';
  
  if (filterType === 'subtopic' && selectedSubtopicId) {
    const selectedSubtopic = subtopics.find(s => s._id === selectedSubtopicId);
    if (selectedSubtopic) {
      endpoint = `/api/questions/all/subtopic/${selectedSubtopic.subtopic_name}`;
    }
  } else if (filterType === 'exam' && selectedExamId) {
    const selectedExam = exams.find(e => e._id === selectedExamId);
    if (selectedExam) {
      endpoint = `/api/questions/all/exam/${selectedExam.exam_name}`;
    }
  } else if (filterType === 'both' && selectedSubtopicId && selectedExamId) {
    const selectedSubtopic = subtopics.find(s => s._id === selectedSubtopicId);
    const selectedExam = exams.find(e => e._id === selectedExamId);
    if (selectedSubtopic && selectedExam) {
      endpoint = `/api/questions/all/exam/${selectedExam.exam_name}/subtopic/${selectedSubtopic.subtopic_name}`;
    }
  }
  
  if (endpoint) {
    const response = await axiosInstance.get(endpoint);
    setQuestions(response.data);
    setCurrentPage(1); // Reset to first page when new data is loaded
  }
}catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to load questions');
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
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

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/questions/delete/${questionId}`);
      setSuccessMessage('Question deleted successfully!');
      
      // Remove the deleted question from the state
      setQuestions(prevQuestions => 
        prevQuestions.filter((q: Question) => q._id !== questionId)
      );
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting question:', error);
      setError('Failed to delete question. Please try again.');
    }
  };

  const handleEditQuestion = (questionId: string) => {
    router.push(`/admin/edit-question/${questionId}`);
  };

  const handleViewQuestion = (questionId: string) => {
    router.push(`/view-question/${questionId}`);
  };

  const handleFilterChange = (type: string) => {
    setFilterType(type);
    setSelectedSubtopicId('');
    setSelectedExamId('');
    setQuestions([]);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchQuestions();
  };

  // Filter questions based on search term
  const filteredQuestions = questions.filter((q: Question) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return q.question.question.toLowerCase().includes(searchLower) ||
           (q.question.answer && q.question.answer.toLowerCase().includes(searchLower));
  });

  // Pagination logic
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const truncateText = (text: string, maxLength = 100) => {
    const cleanText = stripHtml(text);
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + '...';
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
            Manage Questions
          </h2>
          <p className="text-slate-300 text-lg">
            View, edit, and delete questions from the question bank
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

        {/* Filters Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter Questions
          </h3>
          
          {/* Filter Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Filter Type
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="all"
                  checked={filterType === 'all'}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span className="text-slate-300">All Questions</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="subtopic"
                  checked={filterType === 'subtopic'}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span className="text-slate-300">By Subtopic</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="exam"
                  checked={filterType === 'exam'}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span className="text-slate-300">By Exam</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="both"
                  checked={filterType === 'both'}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span className="text-slate-300">By Both</span>
              </label>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Subtopic Filter */}
            {(filterType === 'subtopic' || filterType === 'both') && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Subtopic
                </label>
                {loadingSubtopics ? (
                  <div className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500 mr-2"></div>
                    <span className="text-slate-400">Loading...</span>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedSubtopicId}
                      onChange={(e) => setSelectedSubtopicId(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-800 text-slate-300">
                        Choose a subtopic...
                      </option>
                      {subtopics.map((subtopic) => (
                        <option 
                          key={subtopic._id} 
                          value={subtopic._id} 
                          className="bg-slate-800 text-white"
                        >
                          {subtopic.subtopic_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  </div>
                )}
              </div>
            )}

            {/* Exam Filter */}
            {(filterType === 'exam' || filterType === 'both') && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Exam
                </label>
                {loadingExams ? (
                  <div className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500 mr-2"></div>
                    <span className="text-slate-400">Loading...</span>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedExamId}
                      onChange={(e) => setSelectedExamId(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-800 text-slate-300">
                        Choose an exam...
                      </option>
                      {exams.map((exam) => (
                        <option 
                          key={exam._id} 
                          value={exam._id} 
                          className="bg-slate-800 text-white"
                        >
                          {exam.exam_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  </div>
                )}
              </div>
            )}

            {/* Search Box */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Search Questions
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by question or answer..."
                  className="w-full px-4 py-3 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleRefresh}
              disabled={questionsLoading || filterType === 'all'}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${questionsLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              Questions ({filteredQuestions.length})
            </h3>
          </div>

          {filterType === 'all' && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300 text-lg">
                Please select a filter type to view questions
              </p>
            </div>
          )}

          {questionsLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading questions...</p>
            </div>
          )}

          {!questionsLoading && filterType !== 'all' && filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300 text-lg">
                No questions found with the current filters
              </p>
            </div>
          )}

          {!questionsLoading && currentQuestions.length > 0 && (
            <>
              {/* Questions Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Question</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Answer</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Options</th>
                      <th className="text-center py-3 px-4 text-slate-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentQuestions.map((item: Question, index: number) => (
                      <tr key={item._id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-4 px-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {indexOfFirstQuestion + index + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium mb-1">
                                {truncateText(item.question.question, 80)}
                              </p>
                              {item.question.question_image_url && (
                                <div className="flex items-center space-x-1 text-slate-400 text-sm">
                                  <ImageIcon className="h-3 w-3" />
                                  <span>Has image</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {item.question.question_type === 'image' ? (
                              <ImageIcon className="h-4 w-4 text-green-400" />
                            ) : (
                              <FileText className="h-4 w-4 text-blue-400" />
                            )}
                            <span className="text-slate-300 capitalize">
                              {item.question.question_type}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-white font-medium">
                            {item.question.answer || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-slate-300">
                            {item.options?.length || 0} options
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center space-x-2">
                             
                            <button
                              onClick={() => handleEditQuestion(item._id)}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-lg transition-colors"
                              title="Edit Question"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(item._id)}
                              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                              title="Delete Question"
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-slate-300">
                    Showing {indexOfFirstQuestion + 1} to {Math.min(indexOfLastQuestion, filteredQuestions.length)} of {filteredQuestions.length} questions
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          currentPage === page 
                            ? 'bg-yellow-500 text-slate-900 font-medium' 
                            : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default ManageQuestions;