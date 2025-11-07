'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, BookOpen, Plus, ArrowLeft, AlertCircle, CheckCircle, ChevronDown, Upload, X, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import axiosInstance from '@/utils/axiosInstance';
import { AxiosError } from 'axios';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(
  () => import('react-quill-new'),
  { 
    ssr: false,
    loading: () => <div className="h-[200px] bg-gray-50 rounded-lg animate-pulse" />
  }
);

interface UserData {
  username: string;
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

function AddQuestion() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('text');
  const [questionImage, setQuestionImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedSubtopicId, setSelectedSubtopicId] = useState('');
  const [selectedExamIds, setSelectedExamIds] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  
  interface Option {
    option_type: string;
    option_text: string;
    path_url: File | string | null;
    imagePreview?: string;
  }
  
  const [options, setOptions] = useState<Option[]>([
    { option_type: 'text', option_text: '', path_url: null },
    { option_type: 'text', option_text: '', path_url: null },
    { option_type: 'text', option_text: '', path_url: null },
    { option_type: 'text', option_text: '', path_url: null }
  ]);
  
  // Data states
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingSubtopics, setLoadingSubtopics] = useState(false);
  const [loadingExams, setLoadingExams] = useState(false);
  
  const router = useRouter();

  // Enhanced Quill configuration with all features including code
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'formula'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'indent',
    'blockquote', 'code-block',
    'link', 'image', 'formula'
  ];

  useEffect(() => {
    // Load Quill CSS on client side
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
      document.head.appendChild(link);
      
      return () => {
        // Cleanup
        const existingLink = document.querySelector('link[href="https://cdn.quilljs.com/1.3.6/quill.snow.css"]');
        if (existingLink) {
          existingLink.remove();
        }
      };
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
    fetchSubtopics();
    fetchExams();
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

  const fetchSubtopics = async () => {
    setLoadingSubtopics(true);
    try {
      const response = await axiosInstance.get('/api/subtopics/all');
      setSubtopics(response.data);
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      console.error('Error fetching exams:', error);
      setError('Failed to load exams');
    } finally {
      setLoadingExams(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
      setUser(null);
      router.push('/admin/login');
    } catch (error: unknown) {
      console.error('Logout error:', error);
      setUser(null);
      router.push('/admin/login');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setQuestionImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          setImagePreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const removeImage = () => {
    setQuestionImage(null);
    setImagePreview(null);
    const fileInput = document.getElementById('questionImage') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleOptionChange = (index: number, field: string, value: any) => {
    const newOptions = [...options];
    if (field === 'image') {
      if (value && value.target && value.target.files?.[0]) {
        const file = value.target.files[0];
        if (!file.type.startsWith('image/')) {
          setError('Please select a valid image file');
          return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          setError('Image size should be less than 5MB');
          return;
        }

        newOptions[index].path_url = file;
        
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result && typeof e.target.result === 'string') {
            newOptions[index].imagePreview = e.target.result;
            setOptions([...newOptions]);
          }
        };
        reader.readAsDataURL(file);
      }
    } else {
      (newOptions[index] as any)[field] = value;
    }
    setOptions(newOptions);
  };

  const removeOptionImage = (index: number) => {
    const newOptions = [...options];
    newOptions[index].path_url = null;
    newOptions[index].imagePreview = undefined;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { option_type: 'text', option_text: '', path_url: null }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      
      // Clear answer if the removed option was the selected answer
      const answerIndex = answer ? answer.charCodeAt(0) - 65 : -1;
      if (answerIndex === index) {
        setAnswer('');
      }
    }
  };

  const handleExamSelection = (examId: string) => {
    setSelectedExamIds(prev => {
      if (prev.includes(examId)) {
        return prev.filter(id => id !== examId);
      } else {
        return [...prev, examId];
      }
    });
  };

  const validateForm = () => {
    if (!questionText.trim()) {
      setError('Please enter question text');
      return false;
    }
    
    if (questionType === 'image' && !questionImage) {
      setError('Please upload a question image');
      return false;
    }
    
    if (!selectedSubtopicId) {
      setError('Please select a subtopic');
      return false;
    }
    
    const filledOptions = options.filter(opt => opt.option_text.trim());
    if (filledOptions.length < 2) {
      setError('Please provide at least 2 options');
      return false;
    }
    
    if (!answer.trim()) {
      setError('Please select the correct answer');
      return false;
    }
    
    // Validate that the selected answer corresponds to a valid option
    const answerIndex = answer.charCodeAt(0) - 65;
    if (answerIndex < 0 || answerIndex >= options.length) {
      setError('Please select a valid answer from the options');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      
      // Get the actual option text for the answer
      const answerIndex = answer.charCodeAt(0) - 65;
      const selectedOption = options[answerIndex];
      const answerText = selectedOption && selectedOption.option_text.trim() 
        ? selectedOption.option_text.trim() 
        : answer.trim();
      
      formData.append('question', questionText.trim());
      formData.append('question_type', questionType);
      formData.append('subtopic_id', selectedSubtopicId);
      formData.append('answer', answerText);
      formData.append('explanation', explanation.trim());
      
      if (questionType === 'image' && questionImage) {
        formData.append('question_image', questionImage);
      }
      
      formData.append('exam_ids', JSON.stringify(selectedExamIds));
      
      const validOptions = options.filter(opt => 
        (opt.option_type === 'text' && opt.option_text.trim()) || 
        (opt.option_type === 'image' && (opt.option_text.trim() || opt.path_url))
      );

      formData.append('options', JSON.stringify(validOptions.map(opt => ({
        option_type: opt.option_type,
        option_text: opt.option_text.trim()
      }))));

      validOptions.forEach((opt, index) => {
        if (opt.option_type === 'image' && opt.path_url instanceof File) {
          formData.append(`option_image_${index}`, opt.path_url);
        }
      });

      const response = await axiosInstance.post('/api/questions/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setSuccessMessage('Question added successfully!');
        
        setQuestionText('');
        setQuestionType('text');
        setQuestionImage(null);
        setImagePreview(null);
        setSelectedSubtopicId('');
        setSelectedExamIds([]);
        setAnswer('');
        setExplanation('');
        setOptions([
          { option_type: 'text', option_text: '', path_url: null },
          { option_type: 'text', option_text: '', path_url: null },
          { option_type: 'text', option_text: '', path_url: null },
          { option_type: 'text', option_text: '', path_url: null }
        ]);
        
        const fileInput = document.getElementById('questionImage') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error: unknown) {
      console.error('Error adding question:', error);
      setError(error instanceof AxiosError && error.response?.data?.message 
        ? error.response.data.message 
        : 'Error adding question');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        .ql-toolbar {
          background: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 6px 6px 0 0 !important;
        }
        .ql-container {
          border: 1px solid #e5e7eb !important;
          border-top: none !important;
          border-radius: 0 0 6px 6px !important;
          background: white !important;
        }
        .ql-editor {
          color: #111827 !important;
          font-size: 14px !important;
          min-height: 100px !important;
        }
        .ql-editor.ql-blank::before {
          color: #9ca3af !important;
        }
      `}</style>
 
      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-4 mt-20"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Add Question</h2>
          <p className="text-sm text-gray-600">Create a new question for the question bank</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start gap-2 text-sm">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-5">
            {/* Question Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="text"
                    checked={questionType === 'text'}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Text</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="image"
                    checked={questionType === 'image'}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Image</span>
                </label>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
              <ReactQuill
                value={questionText}
                onChange={setQuestionText}
                modules={quillModules}
                formats={quillFormats}
                theme="snow"
                placeholder="Enter your question..."
              />
            </div>

            {/* Question Image */}
            {questionType === 'image' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Image</label>
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="questionImage"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label htmlFor="questionImage" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </label>
                  </div>
                ) : (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Question preview"
                      className="max-w-full h-auto rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100"
                    >
                      <X className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Subtopic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtopic</label>
              {loadingSubtopics ? (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg flex items-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Loading...
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedSubtopicId}
                    onChange={(e) => setSelectedSubtopicId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    required
                  >
                    <option value="">Select subtopic</option>
                    {subtopics.map((subtopic) => (
                      <option key={subtopic._id} value={subtopic._id}>
                        {subtopic.subtopic_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Exams */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exams (optional)</label>
              {loadingExams ? (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg flex items-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Loading...
                </div>
              ) : (
                <div className="max-h-32 overflow-y-auto bg-gray-50 border border-gray-300 rounded-lg p-3 space-y-2">
                  {exams.map((exam) => (
                    <label key={exam._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedExamIds.includes(exam._id)}
                        onChange={() => handleExamSelection(exam._id)}
                        className="text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{exam.exam_name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Options */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Options (min. 2)</label>
                <button
                  type="button"
                  onClick={addOption}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              </div>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-sm font-medium text-gray-500 mt-2 min-w-[20px]">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            value="text"
                            checked={option.option_type === 'text'}
                            onChange={(e) => handleOptionChange(index, 'option_type', e.target.value)}
                            className="text-blue-600"
                          />
                          <span className="text-xs text-gray-600">Text</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            value="image"
                            checked={option.option_type === 'image'}
                            onChange={(e) => handleOptionChange(index, 'option_type', e.target.value)}
                            className="text-blue-600"
                          />
                          <span className="text-xs text-gray-600">Image</span>
                        </label>
                      </div>

                      <input
                        type="text"
                        value={option.option_text}
                        onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      />

                      {option.option_type === 'image' && (
                        <div>
                          {!option.imagePreview ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                              <input
                                type="file"
                                id={`optionImage${index}`}
                                accept="image/*"
                                onChange={(e) => handleOptionChange(index, 'image', e)}
                                className="hidden"
                              />
                              <label htmlFor={`optionImage${index}`} className="cursor-pointer">
                                <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                                <p className="text-xs text-gray-600">Upload image</p>
                              </label>
                            </div>
                          ) : (
                            <div className="relative inline-block">
                              <img
                                src={option.imagePreview}
                                alt={`Option ${String.fromCharCode(65 + index)}`}
                                className="max-w-full h-auto rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeOptionImage(index)}
                                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100"
                              >
                                <X className="h-3 w-3 text-gray-600" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="mt-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Answer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
              <div className="relative">
                <select
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  required
                >
                  <option value="">Select correct answer</option>
                  {options.map((option, index) => {
                    const optionLetter = String.fromCharCode(65 + index);
                    const optionText = option.option_text.trim();
                    const displayText = optionText || optionLetter;
                    return (
                      <option key={index} value={optionLetter}>
                        {displayText}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Explanation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Explanation (optional)</label>
              <ReactQuill
                value={explanation}
                onChange={setExplanation}
                modules={quillModules}
                formats={quillFormats}
                theme="snow"
                placeholder="Explain the correct answer..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || subtopics.length === 0 || exams.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Question
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}

export default AddQuestion;