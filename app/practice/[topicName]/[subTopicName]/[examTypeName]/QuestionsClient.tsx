'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, BookmarkCheck, Lightbulb, X, Eye } from 'lucide-react';
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
  examTypeName: string;
  currentPage: number;
  questionsPerPage: number;
}

export default function QuestionsClient({ questions, apiUrl, topicName, subTopicName, examTypeName, currentPage, questionsPerPage }: QuestionsClientProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [savedQuestions, setSavedQuestions] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);
  const trackingRef = useRef(false);
  
  const [showAIExplanationModal, setShowAIExplanationModal] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [isGeneratingAIExplanation, setIsGeneratingAIExplanation] = useState(false);
  const [aiExplanationError, setAiExplanationError] = useState<string | null>(null);
  const [currentQuestionForAI, setCurrentQuestionForAI] = useState<QuestionItem | null>(null);
  
  const [showNormalExplanationModal, setShowNormalExplanationModal] = useState(false);
  const [currentQuestionForNormal, setCurrentQuestionForNormal] = useState<QuestionItem | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const normalModalRef = useRef<HTMLDivElement>(null);
  
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
      behavior: 'smooth'
    });
  }, [currentPage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowAIExplanationModal(false);
      }
      if (normalModalRef.current && !normalModalRef.current.contains(event.target as Node)) {
        setShowNormalExplanationModal(false);
      }
    };

    if (showAIExplanationModal || showNormalExplanationModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showAIExplanationModal, showNormalExplanationModal]);

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
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const getCorrectAnswerOption = (questionItem: QuestionItem) => {
    return questionItem.options.find((option) => 
      option.option_text === questionItem.question.answer ||
      option.option_text.toLowerCase() === questionItem.question.answer.toLowerCase()
    );
  };

  const getOptionStyling = (questionItem: QuestionItem, option: Option) => {
    const isSelected = selectedAnswers[questionItem.question._id] === option._id;
    const correctOption = getCorrectAnswerOption(questionItem);
    const isCorrect = correctOption && correctOption._id === option._id;
    
    if (isSelected) {
      if (isCorrect) {
        return 'bg-green-50 border-green-500 ring-2 ring-green-100';
      } else {
        return 'bg-red-50 border-red-500 ring-2 ring-red-100';
      }
    }
    
    return 'border-gray-200 hover:bg-gray-50 hover:border-[#C0A063]';
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
      setAiExplanationError('Failed to generate AI explanation. Please Try Again.');
    } finally {
      setIsGeneratingAIExplanation(false);
    }
  };

  const closeModal = () => {
    setShowAIExplanationModal(false);
  };

  const handleNormalExplanation = (questionItem: QuestionItem) => {
    setCurrentQuestionForNormal(questionItem);
    setShowNormalExplanationModal(true);
  };

  const closeNormalModal = () => {
    setShowNormalExplanationModal(false);
  };

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  const paginate = (pageNumber: number) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <div className="space-y-4">
        {currentQuestions.map((item, index) => {
          const questionNumber = indexOfFirstQuestion + index + 1;
          return (
            <div key={item.question._id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300">
              <div className="p-4 sm:p-5">
                <div className="mb-4">
                  <div className="bg-[#192A41] rounded-t-xl p-2 sm:p-3 flex justify-between items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#C0A063] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm sm:text-base">{questionNumber}</span>
                      </div>
                      <div className="text-white">
                        <div className="text-sm sm:text-base font-medium">Question {questionNumber} of {questions.length}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSaveQuestion(item.question._id)}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-md sm:rounded-lg transition duration-300 cursor-pointer transform hover:scale-105 ${
                        isMounted && savedQuestions.has(item.question._id)
                          ? 'bg-[#C0A063] text-white hover:bg-opacity-90'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
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
                    className="quill-content text-base sm:text-lg leading-relaxed bg-gradient-to-r from-blue-50 to-amber-50 p-4 rounded-b-xl border-l-4 border-[#C0A063] shadow-md"
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
                  {item.options.map((option) => (
                    <label 
                      key={option._id}
                      className={`flex items-start p-2.5 border rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${getOptionStyling(item, option)}`}
                    >
                      <input
                        type="radio"
                        name={`question-${item.question._id}`}
                        value={option._id}
                        checked={selectedAnswers[item.question._id] === option._id}
                        onChange={() => handleAnswerSelect(item.question._id, option._id)}
                        className="h-4 w-4 text-[#C0A063] border-gray-300 focus:ring-[#C0A063] mt-1 mr-3 cursor-pointer"
                        aria-label={`Select option ${option._id} for question ${questionNumber}`}
                      />
                      <div className="flex-1">
                        {option.option_type === 'text' ? (
                          <div className="text-[#192A41] font-normal" dangerouslySetInnerHTML={{ __html: option.option_text }} />
                        ) : (
                          <div>
                            {option.option_text && (
                              <p className="text-[#192A41] font-normal mb-2">{option.option_text}</p>
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
                    </label>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button
                    onClick={() => handleNormalExplanation(item)}
                    className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#C0A063] text-white rounded-full hover:bg-opacity-90 transition-all duration-300 font-semibold cursor-pointer transform hover:scale-105 shadow-md hover:shadow-lg min-w-[140px]"
                    aria-label="View explanation for this question"
                  >
                    <Eye className="h-4 w-4 transition-transform group-hover:scale-110" aria-hidden="true" />
                    <span>Explanation</span>
                  </button>
                  <button
                    onClick={() => handleAIExplanation(item)}
                    className="px-5 py-2.5 bg-gray-200 text-[#192A41] rounded-full hover:bg-gray-300 transition duration-300 font-semibold flex items-center justify-center gap-2 cursor-pointer transform hover:scale-105"
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
          href={currentPage > 1 ? `/practice/${topicName}/${subTopicName}/${examTypeName}?page=${currentPage - 1}` : '#'}
          onClick={() => currentPage > 1 && paginate(currentPage - 1)}
          className={`px-5 py-2.5 rounded-full font-semibold transition duration-300 transform hover:scale-105 cursor-pointer inline-block ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed hover:scale-100 pointer-events-none'
              : 'bg-gray-200 text-[#192A41] hover:bg-gray-300'
          }`}
          aria-label={currentPage === 1 ? 'Previous page (disabled)' : `Go to page ${currentPage - 1}`}
          aria-disabled={currentPage === 1}
        >
          Previous
        </Link>
        
        <Link
          href={currentPage < Math.ceil(questions.length / questionsPerPage) ? `/practice/${topicName}/${subTopicName}/${examTypeName}?page=${currentPage + 1}` : '#'}
          onClick={() => currentPage < Math.ceil(questions.length / questionsPerPage) && paginate(currentPage + 1)}
          className={`px-5 py-2.5 rounded-full font-semibold transition duration-300 transform hover:scale-105 cursor-pointer inline-block ${
            currentPage === Math.ceil(questions.length / questionsPerPage)
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed hover:scale-100 pointer-events-none'
              : 'bg-[#C0A063] text-white hover:bg-opacity-90'
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
              href={currentPage > 1 ? `/practice/${topicName}/${subTopicName}/${examTypeName}?page=${currentPage - 1}` : '#'}
              onClick={() => currentPage > 1 && paginate(currentPage - 1)}
              className={`p-2 rounded-lg cursor-pointer transform hover:scale-110 transition duration-200 inline-block ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed hover:scale-100 pointer-events-none'
                  : 'text-[#192A41] hover:text-[#C0A063] hover:bg-gray-100'
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
                  href={`/practice/${topicName}/${subTopicName}/${examTypeName}?page=${pageNum}`}
                  onClick={() => paginate(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium transition duration-300 cursor-pointer transform hover:scale-110 inline-flex items-center justify-center ${
                    currentPage === pageNum
                      ? 'bg-[#C0A063] text-white'
                      : 'text-[#192A41] hover:bg-gray-100'
                  }`}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={currentPage === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </Link>
              );
            })}
            
            <Link
              href={currentPage < Math.ceil(questions.length / questionsPerPage) ? `/practice/${topicName}/${subTopicName}/${examTypeName}?page=${currentPage + 1}` : '#'}
              onClick={() => currentPage < Math.ceil(questions.length / questionsPerPage) && paginate(currentPage + 1)}
              className={`p-2 rounded-lg cursor-pointer transform hover:scale-110 transition duration-200 inline-block ${
                currentPage === Math.ceil(questions.length / questionsPerPage)
                  ? 'text-gray-400 cursor-not-allowed hover:scale-100 pointer-events-none'
                  : 'text-[#192A41] hover:text-[#C0A063] hover:bg-gray-100'
              }`}
              aria-label={currentPage === Math.ceil(questions.length / questionsPerPage) ? 'Next page (disabled)' : `Go to page ${currentPage + 1}`}
              aria-disabled={currentPage === Math.ceil(questions.length / questionsPerPage)}
            >
              {'>'}
            </Link>
          </div>
        </div>
      )}

      {/* AI Explanation Modal */}
      {showAIExplanationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative w-full h-full max-h-screen flex items-center justify-center p-4 sm:p-6">
            <div 
              ref={modalRef}
              className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white rounded-lg shadow-xl transition-all duration-300 ease-out flex flex-col max-h-[90vh] sm:max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-lg font-bold text-[#192A41] flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-[#C0A063]" />
                  Owl AI Explanation
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer transform hover:scale-110"
                  aria-label="Close AI explanation modal"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <div className="text-gray-700 text-base leading-relaxed">
                  {isGeneratingAIExplanation ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <div 
                        className="w-10 h-10 border-4 border-[#C0A063] border-t-transparent rounded-full mb-4 animate-spin"
                      ></div>
                      <p className="text-[#192A41] font-medium">Generating explanation...</p>
                    </div>
                  ) : aiExplanationError ? (
                    <div className="text-red-500 text-center py-6">
                      <p className="text-sm text-gray-500 mt-2">
                        Please Try Again 
                      </p>
                    </div>
                  ) : (
                    <div 
                      className="quill-content" 
                      dangerouslySetInnerHTML={{ __html: aiExplanation }} 
                    />
                  )}
                </div>
              </div>
              
              <div className="p-4 pt-3 border-t border-gray-200 flex-shrink-0">
                <div className="flex justify-end flex-col md:flex-row gap-3">
                  <p className="text-sm md:text-base">
                    <strong>Note: </strong>AI might give uncertain answers sometimes - either try again or understand the fault, so please consider our explanation for more clarity.
                  </p>
                  <button
                    onClick={closeModal}
                    className="px-5 py-2.5 bg-gray-200 text-[#192A41] rounded-full hover:bg-gray-300 transition duration-300 font-semibold cursor-pointer transform hover:scale-105 whitespace-nowrap"
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

      {/* Normal Explanation Modal */}
      {showNormalExplanationModal && currentQuestionForNormal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative w-full h-full max-h-screen flex items-center justify-center p-4 sm:p-6">
            <div 
              ref={normalModalRef}
              className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white rounded-lg shadow-xl transition-all duration-300 ease-out flex flex-col max-h-[90vh] sm:max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-lg font-bold text-[#192A41] flex items-center gap-2">
                  <Eye className="h-5 w-5 text-[#C0A063]" />
                  Question Explanation
                </h3>
                <button
                  onClick={closeNormalModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer transform hover:scale-110"
                  aria-label="Close explanation modal"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <div className="space-y-3">
                  {currentQuestionForNormal.question.explanation ? (
                    <div className="text-gray-700 text-base leading-relaxed">
                      <div
                        className="quill-content"
                        dangerouslySetInnerHTML={{ __html: currentQuestionForNormal.question.explanation }}
                      />
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-3">
                      <p>No explanation available for this question.</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 pt-3 border-t border-gray-200 flex-shrink-0">
                <div className="flex justify-end">
                  <button
                    onClick={closeNormalModal}
                    className="px-5 py-2.5 bg-[#C0A063] text-white rounded-full hover:bg-opacity-90 transition duration-300 font-semibold cursor-pointer transform hover:scale-105"
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
    </>
  );
}

