'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BookmarkCheck, Trash2, Eye, X } from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import FloatingNotes from '@/components/FloatingNotes';

interface Option {
  _id: string;
  option_type: string;
  option_text: string;
  path_url?: string;
}

interface Question {
  _id: string;
  question: string;
  answer: string;
  explanation?: string;
  question_image_url?: string;
}

interface QuestionItem {
  question: Question;
  options: Option[];
}

function Saved() {
  const [savedQuestions, setSavedQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;
  
  // Explanation Modal states
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [currentQuestionForExplanation, setCurrentQuestionForExplanation] = useState<QuestionItem | null>(null);
  
  // Refs for modal backdrop click detection
  const explanationModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSavedQuestions();
  }, []);

  // Handle Explanation modal backdrop click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (explanationModalRef.current && event.target instanceof Node && !explanationModalRef.current.contains(event.target)) {
        setShowExplanationModal(false);
      }
    }

    if (showExplanationModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    }
  }, [showExplanationModal]);

  const fetchSavedQuestions = async () => {
    try {
      setLoading(true);
      
      // Get saved question IDs from localStorage
      const savedIds = JSON.parse(localStorage.getItem('savedQuestions') || '[]');
      
      if (savedIds.length === 0) {
        setSavedQuestions([]);
        setLoading(false);
        return;
      }

      // Fetch each question with its options
      const questionsPromises = savedIds.map(async (questionId: string) => {
        try {
          const response = await axiosInstance.get(`/api/questions/id/${questionId}`);
          return response.data;
        } catch (err) {
          console.error(`Error fetching question ${questionId}:`, err);
          return null; // Return null for failed requests
        }
      });

      const questionsData = await Promise.all(questionsPromises);
      
      // Filter out null values (failed requests) and invalid data
      const validQuestions = questionsData.filter(data => 
        data && data.question && data.options
      );

      setSavedQuestions(validQuestions);
      setError(null);
    } catch (err) {
      setError('Failed to fetch saved questions');
      console.error('Error fetching saved questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedQuestion = (questionId: string) => {
    try {
      // Get current saved questions from localStorage
      const currentSaved = JSON.parse(localStorage.getItem('savedQuestions') || '[]') as string[];
      
      // Remove the question ID
      const updatedSaved = currentSaved.filter((id: string) => id !== questionId);
      
      // Update localStorage
      localStorage.setItem('savedQuestions', JSON.stringify(updatedSaved));
      
      // Update state to remove the question from the UI
      setSavedQuestions(prev => 
        prev.filter(item => item.question._id !== questionId)
      );
      
      // Clean up related states
      setSelectedAnswers(prev => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
      
      setShowAnswers(prev => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
    } catch (error) {
      console.error('Error removing saved question:', error);
    }
  };

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const toggleExplanation = (questionItem: QuestionItem) => {
    setCurrentQuestionForExplanation(questionItem);
    setShowExplanationModal(true);
  };

  const closeExplanationModal = () => {
    setShowExplanationModal(false);
  };

  // Helper function to get the correct answer option for a question
  const getCorrectAnswerOption = (questionItem: QuestionItem) => {
    return questionItem.options.find((option: Option) => 
      option.option_text === questionItem.question.answer ||
      option.option_text.toLowerCase() === questionItem.question.answer.toLowerCase()
    );
  };

  // Helper function to determine option styling
  const getOptionStyling = (questionItem: QuestionItem, option: Option) => {
    const isSelected = selectedAnswers[questionItem.question._id] === option._id;
    const correctOption = getCorrectAnswerOption(questionItem);
    const isCorrect = correctOption && correctOption._id === option._id;
    
    if (isSelected) {
      if (isCorrect) {
        return 'bg-green-500/10 border-2 border-green-500/30 text-green-300';
      } else {
        return 'bg-red-500/10 border-2 border-red-500/30 text-red-300';
      }
    }
    
    return 'border-2 border-gray-800 hover:border-[#6366F1] bg-[#0A0E27]';
  };

  // Get current questions for pagination
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = savedQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E27]">
        <main className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h1 className="sr-only">Saved Questions</h1>
            <div className="text-lg text-white">Loading saved questions...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0E27]">
        <main className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h1 className="text-xl font-bold text-white mb-3">Error Loading Saved Questions</h1>
            <div className="text-lg text-red-400">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  if (savedQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0E27]">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12">
          <div className='hidden md:block'><FloatingNotes /></div>
          
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-gray-400">
            <Link href="/practice" className="hover:text-white cursor-pointer transition-colors">Practice</Link>
            <span className="mx-2">/</span>
            <span className="text-white font-medium">Saved Questions</span>
          </nav>

          <div className="text-center py-16">
            <BookmarkCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">No Saved Questions</h1>
            <p className="text-gray-400 mb-8">You haven't saved any questions yet. Start practicing and save questions for later review.</p>
            <Link 
              href="/practice" 
              className="inline-flex items-center px-6 py-3 bg-[#6366F1] text-white rounded-xl hover:bg-[#5558E3] transition duration-300 font-bold cursor-pointer"
            >
              Start Practicing
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12 [&_.quill-content_*]:revert [&_.quill-content_h1]:text-[1.875rem] [&_.quill-content_h1]:font-bold [&_.quill-content_h1]:mb-4 [&_.quill-content_h1]:text-white [&_.quill-content_h1]:leading-[1.3] [&_.quill-content_h2]:text-2xl [&_.quill-content_h2]:font-semibold [&_.quill-content_h2]:mb-3 [&_.quill-content_h2]:text-white [&_.quill-content_h2]:leading-[1.3] [&_.quill-content_h3]:text-xl [&_.quill-content_h3]:font-semibold [&_.quill-content_h3]:mb-2 [&_.quill-content_h3]:text-white [&_.quill-content_h3]:leading-[1.3] [&_.quill-content_ul]:list-disc [&_.quill-content_ul]:pl-6 [&_.quill-content_ul]:mb-3 [&_.quill-content_ol]:list-decimal [&_.quill-content_ol]:pl-6 [&_.quill-content_ol]:mb-3 [&_.quill-content_li]:mb-1 [&_.quill-content_li]:leading-relaxed [&_.quill-content_li]:list-item [&_.quill-content_p]:mb-3 [&_.quill-content_p]:text-base [&_.quill-content_p]:leading-relaxed [&_.quill-content_strong]:font-bold [&_.quill-content_em]:italic [&_.quill-content_u]:underline [&_.quill-content_s]:line-through [&_.quill-content_a]:text-[#6366F1] [&_.quill-content_a]:underline hover:[&_.quill-content_a]:text-[#8B5CF6] [&_.quill-content_blockquote]:border-l-4 [&_.quill-content_blockquote]:border-[#6366F1] [&_.quill-content_blockquote]:pl-4 [&_.quill-content_blockquote]:my-4 [&_.quill-content_blockquote]:italic [&_.quill-content_blockquote]:text-gray-400 [&_.quill-content_pre]:bg-[#161B33] [&_.quill-content_pre]:p-4 [&_.quill-content_pre]:rounded-lg [&_.quill-content_pre]:overflow-x-auto [&_.quill-content_pre]:mb-3 [&_.quill-content_code]:bg-[#161B33] [&_.quill-content_code]:px-1 [&_.quill-content_code]:py-0.5 [&_.quill-content_code]:rounded [&_.quill-content_code]:font-mono [&_.quill-content_code]:text-sm [&_.quill-content_code]:text-white [&_.quill-content_code]:border [&_.quill-content_code]:border-gray-800 sm:[&_.quill-content_h1]:text-2xl sm:[&_.quill-content_h2]:text-xl sm:[&_.quill-content_h3]:text-lg sm:[&_.quill-content_p]:text-[0.9375rem] sm:[&_.quill-content_ul]:pl-5 sm:[&_.quill-content_ol]:pl-5">
        <div className='hidden md:block'><FloatingNotes /></div>
        
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-gray-400">
            <Link href="/practice" className="hover:text-white cursor-pointer transition-colors">Practice</Link>
            <span className="mx-2">/</span>
            <span className="text-white font-medium">Saved Questions</span>
          </nav>

        {/* Title and Description */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Saved Questions</h1>
              <p className="text-gray-400">Review your saved questions ({savedQuestions.length} total)</p>
            </div>
           </div>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {currentQuestions.map((item, index) => (
            <div key={item.question._id} className="bg-[#161B33] rounded-xl border border-gray-800 hover:border-[#6366F1] transition duration-300">
              <div className="p-6 sm:p-8">
                {/* Question Header */}
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-sm font-semibold text-white/80">
                      Question {indexOfFirstQuestion + index + 1} of {savedQuestions.length}
                    </h2>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => removeSavedQuestion(item.question._id)}
                      className="flex items-center gap-2 px-3 py-2 bg-red-500 bg-opacity-10 text-red-400 rounded-lg hover:bg-red-500 hover:bg-opacity-20 transition duration-300 border border-red-500 border-opacity-30"
                      title="Remove from saved"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                      <span className="text-sm font-medium hidden md:block text-white/80">Remove</span>
                    </button>
                  </div>
                  
                  {/* Question Content */}
                  <div 
                    className="text-lg text-white/80 leading-relaxed prose max-w-none quill-content prose-invert"
                    dangerouslySetInnerHTML={{ __html: item.question.question }}
                  />
                  
                  {item.question.question_image_url && (
                    <div className="mt-4">
                      <img 
                        src={`${process.env.NEXT_PUBLIC_CLIENT_URL || process.env.NEXT_PUBLIC_SITE_URL || ''}/uploads/${item.question.question_image_url}`}
                        alt="Question"
                        className="max-w-full h-auto rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {item.options.map((option) => (
                    <label 
                      key={option._id}
                      className={`flex items-start p-4 rounded-lg cursor-pointer transition-all duration-200 ${getOptionStyling(item, option)}`}
                    >
                      <input
                        type="radio"
                        name={`question-${item.question._id}`}
                        value={option._id}
                        checked={selectedAnswers[item.question._id] === option._id}
                        onChange={() => handleAnswerSelect(item.question._id, option._id)}
                        className="h-4 w-4 text-[#6366F1] border-gray-700 focus:ring-[#6366F1] mt-1 mr-3 cursor-pointer bg-[#0A0E27]"
                      />
                      <div className="flex-1">
                        {option.option_type === 'text' ? (
                          <div className="text-white/80 font-medium" dangerouslySetInnerHTML={{ __html: option.option_text }} />
                        ) : (
                          <div>
                            {option.option_text && (
                              <p className="text-white/80 font-medium mb-2">{option.option_text}</p>
                            )}
                            {option.path_url && (
                              <img 
                                src={`${process.env.NEXT_PUBLIC_CLIENT_URL || process.env.NEXT_PUBLIC_SITE_URL || ''}/uploads/${option.path_url}`}
                                alt="Option"
                                className="max-w-xs h-auto rounded-lg"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                {/* Show Answer Button */}
                <button
                  onClick={() => toggleExplanation(item)}
                  className="mt-6 px-6 py-3 bg-[#6366F1] text-white rounded-xl hover:bg-[#5558E3] transition duration-300 font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                  Explanation
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 mb-8">
          <button
            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-6 py-3 rounded-xl font-bold transition duration-300 cursor-pointer ${
              currentPage === 1
                ? 'bg-[#161B33] text-gray-500 cursor-not-allowed border border-gray-800'
                : 'bg-[#161B33] text-white hover:bg-[#1a1f3a] border border-gray-800'
            }`}
          >
            Previous
          </button>
          
          <button
            onClick={() => currentPage < Math.ceil(savedQuestions.length / questionsPerPage) && paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(savedQuestions.length / questionsPerPage)}
            className={`px-6 py-3 rounded-xl font-bold transition duration-300 cursor-pointer ${
              currentPage === Math.ceil(savedQuestions.length / questionsPerPage)
                ? 'bg-[#161B33] text-gray-500 cursor-not-allowed border border-gray-800'
                : 'bg-[#6366F1] text-white hover:bg-[#5558E3]'
            }`}
          >
            Next
          </button>
        </div>

        {/* Pagination */}
        {savedQuestions.length > questionsPerPage && (
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg cursor-pointer ${
                  currentPage === 1
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-white hover:text-[#6366F1] hover:bg-[#161B33]'
                }`}
              >
                ‹
              </button>
              
              {Array.from({ length: Math.ceil(savedQuestions.length / questionsPerPage) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`w-10 h-10 rounded-lg font-bold transition duration-300 cursor-pointer ${
                    currentPage === index + 1
                      ? 'bg-[#6366F1] text-white'
                      : 'text-white hover:bg-[#161B33] border border-gray-800'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => currentPage < Math.ceil(savedQuestions.length / questionsPerPage) && paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(savedQuestions.length / questionsPerPage)}
                className={`p-2 rounded-lg cursor-pointer ${
                  currentPage === Math.ceil(savedQuestions.length / questionsPerPage)
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-white hover:text-[#6366F1] hover:bg-[#161B33]'
                }`}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </main>
      
      {/* Explanation Modal */}
      {showExplanationModal && currentQuestionForExplanation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="relative w-full h-full max-h-screen flex items-center justify-center p-4 sm:p-6">
            <div 
              ref={explanationModalRef}
              className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-[#161B33] border border-gray-800 rounded-xl shadow-xl transition-all duration-300 ease-out flex flex-col max-h-[90vh] sm:max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 pb-4 border-b border-gray-800 flex-shrink-0">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-[#6366F1]" />
                  Explanation
                </h3>
                <button
                  onClick={closeExplanationModal}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer transform hover:scale-110"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#0A0E27] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-600">
                <div className="space-y-4">
                  {/* Correct Answer */}
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                    <p className="font-semibold text-green-300">
                      Correct Answer: {currentQuestionForExplanation.question.answer}
                    </p>
                  </div>
                  
                  {/* Explanation */}
                  {currentQuestionForExplanation.question.explanation && (
                    <div className="text-white/80 text-base leading-relaxed">
                      <div
                        className="prose prose-sm max-w-none prose-invert prose-headings:text-white prose-strong:text-white prose-p:text-white/80 prose-p:leading-relaxed quill-content"
                        dangerouslySetInnerHTML={{ __html: currentQuestionForExplanation.question.explanation }}
                      />
                    </div>
                  )}

                  {!currentQuestionForExplanation.question.explanation && (
                    <div className="text-gray-400 text-center py-4">
                      <p>No explanation available for this question.</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-4 sm:p-6 pt-4 border-t border-gray-800 flex-shrink-0">
                <div className="flex justify-end">
                  <button
                    onClick={closeExplanationModal}
                    className="px-6 py-3 bg-[#6366F1] text-white rounded-xl hover:bg-[#5558E3] transition duration-300 font-bold cursor-pointer transform hover:scale-105"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Saved;