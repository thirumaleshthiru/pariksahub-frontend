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
  Save, 
  X, 
  CheckCircle,
  Trophy,
  Award,
  Shield,
  Brain,
  Heart,
  BookOpen,
  Target,
  ArrowLeft,
  BarChart3
} from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';

interface ExamPattern {
  _id: string;
  exam_name: string;
  exam_level: string;
  slug: string;
  featured?: boolean;
  is_active?: boolean;
  [key: string]: any;
}

function ManageExamPatterns() {
  const [examPatterns, setExamPatterns] = useState<ExamPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamPattern | null>(null);
  const [stats, setStats] = useState<any>({});
  const [filters, setFilters] = useState({
    search: '',
    exam_level: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    hasNext: false,
    hasPrev: false
  });
  const router = useRouter();

  const [formData, setFormData] = useState({
    exam_name: '',
    exam_level: 'All',
    total_questions: 100,
    total_marks: 100,
    duration: 120,
    sections: [{
      section_name: '',
      section_code: '',
      questions: 25,
      marks_per_question: 1,
      total_marks: 25,
      duration: 30,
      topics: [],
      question_types: ['MCQ']
    }],
    marking_scheme: {
      correct_answer: 1,
      wrong_answer: 0,
      negative_marking: false,
      negative_marking_value: 0
    },
    eligibility_criteria: {
      age_limit: { min: 18, max: 35 },
      education_qualification: '',
      nationality: 'Indian',
      experience_required: ''
    },
    exam_frequency: 'Annual',
    application_fee: 0,
    exam_mode: 'Online',
    language_options: ['English', 'Hindi'],
    important_dates: [],
    preparation_strategy: {
      recommended_study_time: '',
      important_topics: [],
      practice_tips: [],
      reference_books: [],
      online_resources: []
    },
    difficulty_level: 'Medium',
    competition_level: 'Medium',
    success_rate: 0,
    average_score: 0,
    cutoff_marks: {
      general: 0,
      obc: 0,
      sc: 0,
      st: 0
    },
    is_active: true,
    featured: false,
    tags: [],
    description: '',
    exam_logo: '',
    exam_color: '#3B82F6'
  });

  useEffect(() => {
    fetchExamPatterns();
    fetchStats();
  }, [filters, pagination.current]);

  const fetchExamPatterns = async () => {
    try {
      setLoading(true);
    const params = new URLSearchParams();
    params.append('page', pagination.current.toString());
    params.append('limit', '10');
    if (filters.search) params.append('search', filters.search);
    if (filters.exam_level) params.append('exam_level', filters.exam_level);

      const response = await axiosInstance.get(`/api/exam-patterns/admin/all?${params}`);
      setExamPatterns(response.data.examPatterns);
      setPagination(response.data.pagination);
    } catch (error) {
      setError('Failed to load exam patterns');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/api/exam-patterns/admin/stats');
      setStats(response.data);
    } catch (error) {
    }
  };

  const handleCreate = () => {
    setEditingExam(null);
    setFormData({
      exam_name: '',
      exam_level: 'All',
      total_questions: 100,
      total_marks: 100,
      duration: 120,
      sections: [{
        section_name: '',
        section_code: '',
        questions: 25,
        marks_per_question: 1,
        total_marks: 25,
        duration: 30,
        topics: [],
        question_types: ['MCQ']
      }],
      marking_scheme: {
        correct_answer: 1,
        wrong_answer: 0,
        negative_marking: false,
        negative_marking_value: 0
      },
      eligibility_criteria: {
        age_limit: { min: 18, max: 35 },
        education_qualification: '',
        nationality: 'Indian',
        experience_required: ''
      },
      exam_frequency: 'Annual',
      application_fee: 0,
      exam_mode: 'Online',
      language_options: ['English', 'Hindi'],
      important_dates: [],
      preparation_strategy: {
        recommended_study_time: '',
        important_topics: [],
        practice_tips: [],
        reference_books: [],
        online_resources: []
      },
      difficulty_level: 'Medium',
      competition_level: 'Medium',
      success_rate: 0,
      average_score: 0,
      cutoff_marks: {
        general: 0,
        obc: 0,
        sc: 0,
        st: 0
      },
      is_active: true,
      featured: false,
      tags: [],
      description: '',
      exam_logo: '',
      exam_color: '#3B82F6'
    });
    setShowModal(true);
  };

  const handleEdit = (exam: ExamPattern) => {
    router.push(`/admin/edit-exam-pattern/${exam._id}`);
  };

  const handleSave = async () => {
    try {
      if (editingExam) {
        await axiosInstance.put(`/api/exam-patterns/admin/${editingExam._id}`, formData);
      } else {
        await axiosInstance.post('/api/exam-patterns/admin/create', formData);
      }
      setShowModal(false);
      fetchExamPatterns();
      fetchStats();
    } catch (error) {
      setError('Failed to save exam pattern');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this exam pattern?')) {
      try {
        await axiosInstance.delete(`/api/exam-patterns/admin/${id}`);
        fetchExamPatterns();
        fetchStats();
      } catch (error) {
        setError('Failed to delete exam pattern');
      }
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      await axiosInstance.patch(`/api/exam-patterns/admin/${id}/featured`, {
        featured: !currentStatus
      });
      fetchExamPatterns();
    } catch (error) {
    }
  };

  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, {
        section_name: '',
        section_code: '',
        questions: 25,
        marks_per_question: 1,
        total_marks: 25,
        duration: 30,
        topics: [],
        question_types: ['MCQ']
      }]
    }));
  };

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const updateSection = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const getExamTypeIcon = (examName: string     ) => {
    const name = examName.toLowerCase();
    if (name.includes('ssc')) return <Shield className="h-4 w-4" />;
    if (name.includes('rrb')) return <Trophy className="h-4 w-4" />;
    if (name.includes('banking') || name.includes('bank')) return <Target className="h-4 w-4" />;
    if (name.includes('upsc')) return <Award className="h-4 w-4" />;
    if (name.includes('defense') || name.includes('defence')) return <Shield className="h-4 w-4" />;
    if (name.includes('engineering') || name.includes('jee')) return <Brain className="h-4 w-4" />;
    if (name.includes('medical') || name.includes('neet')) return <Heart className="h-4 w-4" />;
    return <BookOpen className="h-4 w-4" />;
  };

  if (loading && examPatterns.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading exam patterns...</p>
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
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="p-2 text-white hover:text-blue-300 hover:bg-white/10 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-slate-900" />
              </div>
              <h1 className="text-xl font-bold text-white">Manage Exam Patterns</h1>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 font-semibold px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              <span>Add Exam Pattern</span>
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
                <Trophy className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Exams</p>
                <p className="text-2xl font-bold text-white">{stats.totalExams || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Active Exams</p>
                <p className="text-2xl font-bold text-white">{stats.activeExams || 0}</p>
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
                <p className="text-2xl font-bold text-white">{stats.featuredExams || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Exam Types</p>
                <p className="text-2xl font-bold text-white">{stats.examTypesStats?.length || 0}</p>
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
                  placeholder="Search exam patterns..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filters.exam_level}
                onChange={(e) => setFilters(prev => ({ ...prev, exam_level: e.target.value }))}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Levels</option>
                <option value="Graduate">Graduate</option>
                <option value="Post Graduate">Post Graduate</option>
                <option value="Diploma">Diploma</option>
                <option value="Certificate">Certificate</option>
                <option value="All">All</option>
              </select>
            </div>
          </div>
        </div>

        {/* Exam Patterns Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Exam</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Questions</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {examPatterns.map((exam) => (
                  <tr key={exam._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="bg-blue-500/20 rounded-full p-2 mr-3">
                            {getExamTypeIcon(exam.exam_name)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{exam.exam_name}</div>
                            <div className="text-sm text-gray-300">{exam.exam_level}</div>
                          </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                        {exam.exam_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{exam.total_questions}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{exam.duration} min</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          exam.is_active 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {exam.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {exam.featured && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(exam)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(exam._id, exam.featured || false)}
                          className={`p-2 rounded-lg transition-colors ${
                            exam.featured 
                              ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20' 
                              : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/20'
                          }`}
                          title={exam.featured ? 'Remove from featured' : 'Add to featured'}
                        >
                          {exam.featured ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(exam._id)}
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
            Showing {examPatterns.length} of {pagination.total} exam patterns
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingExam ? 'Edit Exam Pattern' : 'Add New Exam Pattern'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Name</label>
                  <input
                    type="text"
                    value={formData.exam_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, exam_name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter exam name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Level</label>
                  <select
                    value={formData.exam_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, exam_level: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  >
                    <option value="Graduate">Graduate</option>
                    <option value="Post Graduate">Post Graduate</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Certificate">Certificate</option>
                    <option value="All">All</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Questions</label>
                  <input
                    type="number"
                    value={formData.total_questions}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_questions: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks</label>
                  <input
                    type="number"
                    value={formData.total_marks}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_marks: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>

              {/* Sections */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Exam Sections</h3>
                  <button
                    onClick={addSection}
                    className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Section</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {formData.sections.map((section, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-800">Section {index + 1}</h4>
                        {formData.sections.length > 1 && (
                          <button
                            onClick={() => removeSection(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
                          <input
                            type="text"
                            value={section.section_name}
                            onChange={(e) => updateSection(index, 'section_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., General Knowledge"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Section Code</label>
                          <input
                            type="text"
                            value={section.section_code}
                            onChange={(e) => updateSection(index, 'section_code', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., GK, MATH, ENG"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Questions</label>
                          <input
                            type="number"
                            value={section.questions}
                            onChange={(e) => updateSection(index, 'questions', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Marks per Question</label>
                          <input
                            type="number"
                            value={section.marks_per_question}
                            onChange={(e) => updateSection(index, 'marks_per_question', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Marking Scheme */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Marking Scheme</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marks for Correct Answer</label>
                    <input
                      type="number"
                      value={formData.marking_scheme.correct_answer}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        marking_scheme: { ...prev.marking_scheme, correct_answer: parseInt(e.target.value) }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marks for Wrong Answer</label>
                    <input
                      type="number"
                      value={formData.marking_scheme.wrong_answer}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        marking_scheme: { ...prev.marking_scheme, wrong_answer: parseInt(e.target.value) }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.marking_scheme.negative_marking}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        marking_scheme: { ...prev.marking_scheme, negative_marking: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Negative Marking</label>
                  </div>
                  
                  {formData.marking_scheme.negative_marking && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Negative Marking Value</label>
                      <input
                        type="number"
                        value={formData.marking_scheme.negative_marking_value}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          marking_scheme: { ...prev.marking_scheme, negative_marking_value: parseInt(e.target.value) }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty_level: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Very Hard">Very Hard</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Competition Level</label>
                  <select
                    value={formData.competition_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, competition_level: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Very High">Very High</option>
                  </select>
                </div>
              </div>

              {/* Status Options */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Active</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Featured</label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter exam description..."
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-3xl">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingExam ? 'Update' : 'Create'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageExamPatterns;
