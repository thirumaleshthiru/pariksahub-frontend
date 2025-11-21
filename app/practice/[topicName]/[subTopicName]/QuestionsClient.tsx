'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, BookmarkCheck, Lightbulb, X, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Link from 'next/link';
import axiosInstance from '@/utils/axiosInstance';

interface Question {
  _id: string;
  question: string;
  answer: string;
  explanation?: string;
  question_image_url?: string;
}

interface Option {
  _id: string;
  option_text: string;
  option_type: string;
  path_url?: string;
}

interface QuestionItem {
  question: Question;
  options: Option[];
}

interface QuestionsClientProps {
  questions: QuestionItem[];
  apiUrl: string;
  topicName: string;
  subTopicName: string;
  currentPage: number;
  questionsPerPage: number;
}

export default function QuestionsClient({ questions, apiUrl, topicName, subTopicName, currentPage, questionsPerPage }: QuestionsClientProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [savedQuestions, setSavedQuestions] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);
  const trackingRef = useRef(false);
  
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [currentQuestionForExplanation, setCurrentQuestionForExplanation] = useState<QuestionItem | null>(null);
  
  const [showAIExplanationModal, setShowAIExplanationModal] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [isGeneratingAIExplanation, setIsGeneratingAIExplanation] = useState(false);
  const [aiExplanationError, setAiExplanationError] = useState<string | null>(null);
  const [currentQuestionForAI, setCurrentQuestionForAI] = useState<QuestionItem | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const explanationModalRef = useRef<HTMLDivElement>(null);
  
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
  const genAI = new GoogleGenerativeAI(API_KEY);

  useEffect(() => {
    setIsMounted(true);
    loadSavedQuestions();
    
    // Prevent duplicate tracking
    if (!trackingRef.current) {
      trackingRef.current = true;
      trackTopicVisit();
    }
  }, []);

  const trackTopicVisit = async () => {
    try {
      const response = await axiosInstance.get('/api/student/profile');
      if (response.status === 200) {
        // User is logged in, track the visit
        await axiosInstance.post('/api/student/track-topic-visit', {
          topicName: topicName,
          subTopicName: subTopicName
        });
      }
    } catch (err) {
      // Not logged in or error, skip tracking
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [currentPage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowAIExplanationModal(false);
      }
    };

    if (showAIExplanationModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showAIExplanationModal]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (explanationModalRef.current && !explanationModalRef.current.contains(event.target as Node)) {
        setShowExplanationModal(false);
      }
    };

    if (showExplanationModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showExplanationModal]);

  const loadSavedQuestions = () => {
    try {
      const saved = localStorage.getItem('savedQuestions');
      if (saved) {
        setSavedQuestions(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error('Error loading saved questions:', error);
    }
  };

  const toggleSaveQuestion = async (questionId: string) => {
    try {
      const newSavedQuestions = new Set(savedQuestions);
      const isCurrentlySaved = savedQuestions.has(questionId);
      
      if (isCurrentlySaved) {
        newSavedQuestions.delete(questionId);
      } else {
        newSavedQuestions.add(questionId);
      }
      setSavedQuestions(newSavedQuestions);
      localStorage.setItem('savedQuestions', JSON.stringify([...newSavedQuestions]));
      
      // Also save to database if logged in
      try {
        const response = await axiosInstance.get('/api/student/profile');
        if (response.status === 200) {
          // User is logged in, sync with database
          if (isCurrentlySaved) {
            await axiosInstance.post('/api/student/remove-saved-question', { questionId });
          } else {
            await axiosInstance.post('/api/student/save-question', { questionId });
          }
        }
      } catch (err) {
        // Not logged in or error, continue with localStorage only
      }
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const toggleExplanation = (questionItem: QuestionItem) => {
    setCurrentQuestionForExplanation(questionItem);
    setShowExplanationModal(true);
  };

  const getCorrectAnswerOption = (questionItem: QuestionItem) => {
    return questionItem.options.find(
      (option) =>
        option.option_text === questionItem.question.answer ||
        option.option_text.toLowerCase() === questionItem.question.answer.toLowerCase(),
    );
  };

  const getOptionStyling = (questionItem: QuestionItem, option: Option) => {
    const isSelected = selectedAnswers[questionItem.question._id] === option._id;
    const correctOption = getCorrectAnswerOption(questionItem);
    const isCorrect = correctOption && correctOption._id === option._id;

    if (isSelected) {
      if (isCorrect) {
        return 'bg-emerald-50 border-emerald-500 border-2';
      } else {
        return 'bg-amber-50 border-amber-500 border-2';
      }
    }
    return 'border-2 border-gray-800 bg-[#0A0E27] hover:bg-[#1a1f3a] hover:border-[#6366F1] text-white/80';
  };

  const formatAIResponse = (text: string) => {
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/\n\n/g, '</p><p>');
    text = text.replace(/\n/g, '<br>');
    text = `<p>${text}</p>`;
    text = text.replace(/<p><\/p>/g, '');
    text = text.replace(/<p><br><\/p>/g, '');
    return text;
  };

  const handleAIExplanation = async (questionItem: QuestionItem) => {
    setCurrentQuestionForAI(questionItem);
    setShowAIExplanationModal(true);
    setIsGeneratingAIExplanation(true);
    setAiExplanationError(null);
    setAiExplanation('');

    try {
      if (!API_KEY) {
        throw new Error('Google API Key is not configured. Please set NEXT_PUBLIC_GOOGLE_API_KEY.');
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      
      const prompt = `You are an expert educator. Explain this question clearly and simply.

**QUESTION:**
${questionItem.question.question}

**INSTRUCTIONS:**
1. Explain the underlying concept in simple terms
2. Walk through the reasoning step by step
3. End with: "The correct answer is: [letter]"
4. Keep explanation under 200 words
5. Use plain text only - no formatting, headings, or bullet points
6. Write in a conversational tone

Focus only on helping students understand the concept and reasoning.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      text = formatAIResponse(text);
      
      setAiExplanation(text);
    } catch (err) {
      console.error('AI explanation error:', err);
      setAiExplanationError('Failed to generate AI explanation. Try Again');
    } finally {
      setIsGeneratingAIExplanation(false);
    }
  };

  const closeAIModal = () => {
    setShowAIExplanationModal(false);
  };

  const closeExplanationModal = () => {
    setShowExplanationModal(false);
  };

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  const paginate = (pageNumber: number) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <div className="space-y-4">
        {currentQuestions.map((item, index) => {
          const questionNumber = indexOfFirstQuestion + index + 1;
          return (
            <div
              key={item.question._id}
              className="bg-[#161B33] border border-gray-800 rounded-xl hover:border-[#6366F1] transition duration-300"
            >
              <div className="p-4 sm:p-5">
                <div className="mb-4">
                  <div className="bg-[#161B33] border border-gray-800 rounded-t-xl p-2 sm:p-3 flex justify-between items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#6366F1] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm sm:text-base">{questionNumber}</span>
                      </div>
                      <div className="text-white text-sm sm:text-base font-medium whitespace-nowrap">
                        Question {questionNumber} of {questions.length}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSaveQuestion(item.question._id)}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-md sm:rounded-lg transition duration-300 cursor-pointer transform hover:scale-105 ${
                        isMounted && savedQuestions.has(item.question._id)
                          ? 'bg-[#6366F1] text-white hover:bg-[#5558E3]'
                          : 'bg-[#161B33] text-gray-400 hover:bg-[#1a1f3a] border border-gray-800'
                      }`}
                      aria-label={isMounted && savedQuestions.has(item.question._id) ? 'Remove question from saved' : 'Save question for later'}
                    >
                      {isMounted && savedQuestions.has(item.question._id) ? (
                        <BookmarkCheck className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                      ) : (
                        <Bookmark className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                      )}
                      <span className="text-sm font-medium">
                        {isMounted && savedQuestions.has(item.question._id) ? 'Saved' : 'Save'}
                      </span>
                    </button>
                  </div>
                  
                  <div
                    className="quill-content text-base sm:text-lg leading-relaxed bg-[#161B33] border border-gray-800 text-white/80 p-4 rounded-b-xl border-l-4 border-[#6366F1]"
                    dangerouslySetInnerHTML={{ __html: item.question.question }}
                  />
                  {item.question.question_image_url && (
                    <div className="mt-4">
                      <img
                        src={`${apiUrl}/uploads/${item.question.question_image_url}`}
                        alt="Question"
                        className="max-w-full h-auto rounded-lg"
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  {item.options.map((option) => {
                    const isSelected = selectedAnswers[item.question._id] === option._id;
                    const correctOption = getCorrectAnswerOption(item);
                    const isCorrect = correctOption && correctOption._id === option._id;
                    const showResult = isSelected && (isCorrect || !isCorrect);
                    
                    return (
                      <label
                        key={option._id}
                        className={`flex items-start p-2.5 border rounded-lg cursor-pointer transition-all duration-200 ${getOptionStyling(item, option)}`}
                      >
                        <input
                          type="radio"
                          name={`question-${item.question._id}`}
                          value={option._id}
                          checked={isSelected}
                          onChange={() => handleAnswerSelect(item.question._id, option._id)}
                          className={`h-4 w-4 mt-1 mr-3 cursor-pointer ${
                            isSelected && isCorrect
                              ? 'text-emerald-500 border-emerald-500 focus:ring-emerald-500'
                              : isSelected && !isCorrect
                              ? 'text-amber-500 border-amber-500 focus:ring-amber-500'
                              : 'text-[#6366F1] border-gray-700 focus:ring-[#6366F1]'
                          }`}
                          aria-label={`Select option ${option._id} for question ${questionNumber}`}
                        />
                        <div className="flex-1 flex items-start justify-between gap-2">
                          <div className="flex-1">
                            {option.option_type === 'text' ? (
                              <div
                                className={`quill-content ${
                                  isSelected && isCorrect
                                    ? 'text-gray-800'
                                    : isSelected && !isCorrect
                                    ? 'text-gray-800'
                                    : 'text-white/80'
                                }`}
                                dangerouslySetInnerHTML={{ __html: option.option_text }}
                              />
                            ) : (
                              <div>
                                {option.option_text && (
                                  <p className={`font-normal mb-2 ${
                                    isSelected && isCorrect
                                      ? 'text-gray-800'
                                      : isSelected && !isCorrect
                                      ? 'text-gray-800'
                                      : 'text-white/80'
                                  }`}>{option.option_text}</p>
                                )}
                                {option.path_url && (
                                  <img
                                    src={`${apiUrl}/uploads/${option.path_url}`}
                                    alt="Option"
                                    className="max-w-xs h-auto rounded-lg"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                          {showResult && (
                            <div className="flex-shrink-0 mt-1">
                              {isCorrect ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                              ) : (
                                <XCircle className="h-5 w-5 text-amber-500" aria-hidden="true" />
                              )}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button
                    onClick={() => toggleExplanation(item)}
                    className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#6366F1] text-white rounded-xl hover:bg-[#5558E3] transition-all duration-300 font-bold cursor-pointer transform hover:scale-105 min-w-[140px]"
                    aria-label="View explanation for this question"
                  >
                    <Eye className="h-4 w-4 transition-transform group-hover:scale-110" aria-hidden="true" />
                    <span>Explanation</span>
                  </button>
                  <button
                    onClick={() => handleAIExplanation(item)}
                    className="px-5 py-2.5 bg-[#161B33] border border-gray-800 text-white rounded-xl hover:border-[#6366F1] hover:bg-[#1a1f3a] transition duration-300 font-bold flex items-center justify-center gap-2 cursor-pointer transform hover:scale-105"
                    aria-label="Get AI explanation for this question"
                  >
                    <Lightbulb className="h-4 w-4" aria-hidden="true" />
                    Owl AI Explanation
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-between items-center mt-6 mb-4">
        <Link
          href={currentPage > 1 ? `/practice/${topicName}/${subTopicName}?page=${currentPage - 1}` : '#'}
          onClick={() => currentPage > 1 && paginate(currentPage - 1)}
          className={`px-5 py-2.5 rounded-xl font-bold transition duration-300 transform hover:scale-105 cursor-pointer inline-block ${
            currentPage === 1
              ? 'bg-[#161B33] text-gray-600 cursor-not-allowed hover:scale-100 pointer-events-none border border-gray-800'
              : 'bg-[#161B33] text-white hover:bg-[#1a1f3a] border border-gray-800 hover:border-[#6366F1]'
          }`}
          aria-label={currentPage === 1 ? 'Previous page (disabled)' : `Go to page ${currentPage - 1}`}
          aria-disabled={currentPage === 1}
        >
          Previous
        </Link>
        <Link
          href={currentPage < Math.ceil(questions.length / questionsPerPage) ? `/practice/${topicName}/${subTopicName}?page=${currentPage + 1}` : '#'}
          onClick={() => currentPage < Math.ceil(questions.length / questionsPerPage) && paginate(currentPage + 1)}
          className={`px-5 py-2.5 rounded-xl font-bold transition duration-300 transform hover:scale-105 cursor-pointer inline-block ${
            currentPage === Math.ceil(questions.length / questionsPerPage)
              ? 'bg-[#161B33] text-gray-600 cursor-not-allowed hover:scale-100 pointer-events-none border border-gray-800'
              : 'bg-[#6366F1] text-white hover:bg-[#5558E3]'
          }`}
          aria-label={currentPage === Math.ceil(questions.length / questionsPerPage) ? 'Next page (disabled)' : `Go to page ${currentPage + 1}`}
          aria-disabled={currentPage === Math.ceil(questions.length / questionsPerPage)}
        >
          Next
        </Link>
      </div>
      
      {questions.length > questionsPerPage && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Link
              href={currentPage > 1 ? `/practice/${topicName}/${subTopicName}?page=${currentPage - 1}` : '#'}
              onClick={() => currentPage > 1 && paginate(currentPage - 1)}
              className={`p-2 rounded-lg cursor-pointer transform hover:scale-110 transition duration-200 inline-block ${
                currentPage === 1
                  ? 'text-gray-600 cursor-not-allowed hover:scale-100 pointer-events-none'
                  : 'text-white hover:text-[#6366F1] hover:bg-[#161B33]'
              }`}
              aria-label={currentPage === 1 ? 'Previous page (disabled)' : `Go to page ${currentPage - 1}`}
              aria-disabled={currentPage === 1}
            >
              {'<'}
            </Link>
            {Array.from({ length: Math.ceil(questions.length / questionsPerPage) }).map((_, index) => {
              const pageNum = index + 1;
              return (
                <Link
                  key={index}
                  href={`/practice/${topicName}/${subTopicName}?page=${pageNum}`}
                  onClick={() => paginate(pageNum)}
                  className={`w-10 h-10 rounded-lg font-bold transition duration-300 cursor-pointer transform hover:scale-110 inline-flex items-center justify-center ${
                    currentPage === pageNum ? 'bg-[#6366F1] text-white' : 'text-white hover:bg-[#161B33] hover:text-[#6366F1]'
                  }`}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={currentPage === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </Link>
              );
            })}
            <Link
              href={currentPage < Math.ceil(questions.length / questionsPerPage) ? `/practice/${topicName}/${subTopicName}?page=${currentPage + 1}` : '#'}
              onClick={() => currentPage < Math.ceil(questions.length / questionsPerPage) && paginate(currentPage + 1)}
              className={`p-2 rounded-lg cursor-pointer transform hover:scale-110 transition duration-200 inline-block ${
                currentPage === Math.ceil(questions.length / questionsPerPage)
                  ? 'text-gray-600 cursor-not-allowed hover:scale-100 pointer-events-none'
                  : 'text-white hover:text-[#6366F1] hover:bg-[#161B33]'
              }`}
              aria-label={currentPage === Math.ceil(questions.length / questionsPerPage) ? 'Next page (disabled)' : `Go to page ${currentPage + 1}`}
              aria-disabled={currentPage === Math.ceil(questions.length / questionsPerPage)}
            >
              {'>'}
            </Link>
          </div>
        </div>
      )}

      {/* Normal Explanation Modal */}
      {showExplanationModal && currentQuestionForExplanation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative w-full h-full max-h-screen flex items-center justify-center p-4 sm:p-6">
            <div 
              ref={explanationModalRef}
              className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-[#161B33] border border-gray-800 rounded-xl shadow-xl transition-all duration-300 ease-out flex flex-col max-h-[90vh] sm:max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-800 flex-shrink-0">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-[#6366F1]" />
                  Explanation
                </h3>
                <button
                  onClick={closeExplanationModal}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer transform hover:scale-110"
                  aria-label="Close explanation modal"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <div className="space-y-3">
                  {currentQuestionForExplanation.question.explanation && (
                    <div className="text-white/80 text-base leading-relaxed">
                      <div
                        className="quill-content text-white/80"
                        dangerouslySetInnerHTML={{ __html: currentQuestionForExplanation.question.explanation }}
                      />
                    </div>
                  )}

                  {!currentQuestionForExplanation.question.explanation && (
                    <div className="text-gray-400 text-center py-3">
                      <p>No explanation available for this question.</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 pt-3 border-t border-gray-800 flex-shrink-0">
                <div className="flex justify-end">
                  <button
                    onClick={closeExplanationModal}
                    className="px-5 py-2.5 bg-[#6366F1] text-white rounded-xl hover:bg-[#5558E3] transition duration-300 font-bold cursor-pointer transform hover:scale-105"
                    aria-label="Close explanation modal"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* AI Explanation Modal */}
      {showAIExplanationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative w-full h-full max-h-screen flex items-center justify-center p-4 sm:p-6">
            <div 
              ref={modalRef}
              className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-[#161B33] border border-gray-800 rounded-xl shadow-xl transition-all duration-300 ease-out flex flex-col max-h-[90vh] sm:max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-800 flex-shrink-0">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-[#6366F1]" />
                  Owl AI Explanation
                </h3>
                <button
                  onClick={closeAIModal}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer transform hover:scale-110"
                  aria-label="Close AI explanation modal"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <div className="text-white/80 text-base leading-relaxed">
                  {isGeneratingAIExplanation ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <div 
                        className="w-10 h-10 border-4 border-[#6366F1] border-t-transparent rounded-full mb-4 animate-spin"
                      ></div>
                      <p className="text-white/80 font-bold">Generating explanation...</p>
                    </div>
                  ) : aiExplanationError ? (
                    <div className="text-red-400 text-center py-6">
                      <p className="text-sm text-gray-400 mt-2">
                        Please Try Again 
                      </p>
                    </div>
                  ) : (
                    <div 
                      className="quill-content text-white/80" 
                      dangerouslySetInnerHTML={{ __html: aiExplanation }} 
                    />
                  )}
                </div>
              </div>
              
              <div className="p-4 pt-3 border-t border-gray-800 flex-shrink-0">
                <div className="flex justify-end flex-col md:flex-row gap-3">
                  <p className="text-sm md:text-base text-gray-400">
                    <strong className="text-white">Note: </strong>AI might give uncertain answers sometimes - either try again or understand the fault, so please consider our explanation for more clarity.
                  </p>
                  <button
                    onClick={closeAIModal}
                    className="px-5 py-2.5 bg-[#161B33] border border-gray-800 text-white rounded-xl hover:border-[#6366F1] hover:bg-[#1a1f3a] transition duration-300 font-bold cursor-pointer transform hover:scale-105 whitespace-nowrap"
                    aria-label="Close AI explanation modal"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

