'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bookmark, BookmarkCheck, Lightbulb, X, Eye } from 'lucide-react';
import axiosInstance from '../../../../utils/axiosInstance';
import { formatDisplayText } from '../../../../utils/textUtils';
import FloatingNotes from '../../../../components/FloatingNotes';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Metadata } from 'next';

export default function SubTopicQuestions() {
  const params = useParams();
  const router = useRouter();
  const topicName = params.topicName as string;
  const subTopicName = params.subTopicName as string;
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [savedQuestions, setSavedQuestions] = useState<Set<string>>(new Set());
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [currentQuestionForExplanation, setCurrentQuestionForExplanation] = useState<any>(null);
  
  const [showAIExplanationModal, setShowAIExplanationModal] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [isGeneratingAIExplanation, setIsGeneratingAIExplanation] = useState(false);
  const [aiExplanationError, setAiExplanationError] = useState<string | null>(null);
  const [currentQuestionForAI, setCurrentQuestionForAI] = useState<any>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const explanationModalRef = useRef<HTMLDivElement>(null);
  
  const questionsPerPage = 10;
  
  const displayTopicName = formatDisplayText(topicName);
  const displaySubTopicName = formatDisplayText(subTopicName);
  
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
  const genAI = new GoogleGenerativeAI(API_KEY);

  useEffect(() => {
    fetchQuestions();
    loadSavedQuestions();
  }, [subTopicName]);

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

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setDataLoaded(false);
      setQuestions([]);
      const response = await axiosInstance.get(`/api/questions/subtopic/${subTopicName}`);
      setQuestions(response.data);
      setDataLoaded(true);
      setError(null);
    } catch (err) {
      setError('Failed to fetch questions');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const toggleSaveQuestion = (questionId: string) => {
    try {
      const newSavedQuestions = new Set(savedQuestions);
      if (savedQuestions.has(questionId)) {
        newSavedQuestions.delete(questionId);
      } else {
        newSavedQuestions.add(questionId);
      }
      setSavedQuestions(newSavedQuestions);
      localStorage.setItem('savedQuestions', JSON.stringify([...newSavedQuestions]));
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

  const toggleExplanation = (questionItem: any) => {
    setCurrentQuestionForExplanation(questionItem);
    setShowExplanationModal(true);
  };

  const getCorrectAnswerOption = (questionItem: any) => {
    return questionItem.options.find(
      (option: any) =>
        option.option_text === questionItem.question.answer ||
        option.option_text.toLowerCase() === questionItem.question.answer.toLowerCase(),
    );
  };

  const getOptionStyling = (questionItem: any, option: any) => {
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

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleAIExplanation = async (questionItem: any) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-[#192A41]">Loading questions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-[#192A41]">No questions available for this subtopic.</div>
        </div>
      </div>
    );
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-4">
        <div className="hidden md:block">
          <FloatingNotes />
        </div>
        
        <nav className="mb-4 text-sm text-gray-500 mt-5">
          <Link href="/practice" className="hover:text-[#C0A063] cursor-pointer">
            Practice
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/practice/${topicName}`} className="hover:text-[#C0A063] cursor-pointer">
            {displayTopicName}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#192A41] font-medium">{displaySubTopicName}</span>
        </nav>
        
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#192A41] mb-2">
            {displaySubTopicName} Practice Questions with Detailed and AI Explanations
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Improve your understanding of {displaySubTopicName} with comprehensive practice questions, clear explanations, and AI-powered guidance from {displayTopicName}.
          </p>
        </div>
        
        <div className="space-y-4">
          {!dataLoaded ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl p-6 max-w-md mx-auto shadow-lg">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-[#192A41] mb-2">Loading Questions</h2>
                <p className="text-gray-600">Please wait while we prepare your questions...</p>
              </div>
            </div>
          ) : currentQuestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl p-6 max-w-md mx-auto shadow-lg">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-[#192A41] mb-2">No Questions Available</h2>
                <p className="text-gray-600">Questions will appear here once they are added to the system.</p>
              </div>
            </div>
          ) : (
            currentQuestions.map((item, index) => (
            <div
              key={item.question._id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300"
            >
              <div className="p-4 sm:p-5">
                <div className="mb-4">
                  <div className="bg-[#192A41] rounded-t-xl p-2 sm:p-3 flex justify-between items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#C0A063] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm sm:text-base">{indexOfFirstQuestion + index + 1}</span>
                      </div>
                      <div className="text-white">
                        <div className="text-sm sm:text-base font-medium">Question {indexOfFirstQuestion + index + 1} of {questions.length}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSaveQuestion(item.question._id)}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-md sm:rounded-lg transition duration-300 cursor-pointer transform hover:scale-105 ${
                        savedQuestions.has(item.question._id)
                          ? 'bg-[#C0A063] text-white hover:bg-opacity-90'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                      }`}
                      title={savedQuestions.has(item.question._id) ? 'Remove from saved' : 'Save question'}
                    >
                      {savedQuestions.has(item.question._id) ? (
                        <BookmarkCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                      ) : (
                        <Bookmark className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                      <span className="text-sm font-medium">
                        {savedQuestions.has(item.question._id) ? 'Saved' : 'Save'}
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
                        src={`${API_URL}/uploads/${item.question.question_image_url}`}
                        alt="Question"
                        className="max-w-full h-auto rounded-lg"
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  {item.options.map((option: any) => (
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
                      />
                      <div className="flex-1">
                        {option.option_type === 'text' ? (
                          <div
                            className="quill-content text-[#192A41]"
                            dangerouslySetInnerHTML={{ __html: option.option_text }}
                          />
                        ) : (
                          <div>
                            {option.option_text && (
                              <p className="text-[#192A41] font-normal mb-2">{option.option_text}</p>
                            )}
                            {option.path_url && (
                              <img
                                src={`${API_URL}/uploads/${option.path_url}`}
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
                    onClick={() => toggleExplanation(item)}
                    className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#C0A063] text-white rounded-full hover:bg-opacity-90 transition-all duration-300 font-semibold cursor-pointer transform hover:scale-105 shadow-md hover:shadow-lg min-w-[140px]"
                  >
                    <Eye className="h-4 w-4 transition-transform group-hover:scale-110" />
                    <span>Explanation</span>
                  </button>
                  <button
                    onClick={() => handleAIExplanation(item)}
                    className="px-5 py-2.5 bg-gray-200 text-[#192A41] rounded-full hover:bg-gray-300 transition duration-300 font-semibold flex items-center justify-center gap-2 cursor-pointer transform hover:scale-105"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Owl AI Explanation
                  </button>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
        
        <div className="flex justify-between items-center mt-6 mb-4">
          <button
            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-5 py-2.5 rounded-full font-semibold transition duration-300 transform hover:scale-105 cursor-pointer ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed hover:scale-100'
                : 'bg-gray-200 text-[#192A41] hover:bg-gray-300'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => currentPage < Math.ceil(questions.length / questionsPerPage) && paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(questions.length / questionsPerPage)}
            className={`px-5 py-2.5 rounded-full font-semibold transition duration-300 transform hover:scale-105 cursor-pointer ${
              currentPage === Math.ceil(questions.length / questionsPerPage)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed hover:scale-100'
                : 'bg-[#C0A063] text-white hover:bg-opacity-90'
            }`}
          >
            Next
          </button>
        </div>
        
        {questions.length > questionsPerPage && (
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg cursor-pointer transform hover:scale-110 transition duration-200 ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed hover:scale-100'
                    : 'text-[#192A41] hover:text-[#C0A063] hover:bg-gray-100'
                }`}
              >
                {'<'}
              </button>
              {Array.from({ length: Math.ceil(questions.length / questionsPerPage) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`w-10 h-10 rounded-lg font-medium transition duration-300 cursor-pointer transform hover:scale-110 ${
                    currentPage === index + 1 ? 'bg-[#C0A063] text-white' : 'text-[#192A41] hover:bg-gray-100'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => currentPage < Math.ceil(questions.length / questionsPerPage) && paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(questions.length / questionsPerPage)}
                className={`p-2 rounded-lg cursor-pointer transform hover:scale-110 transition duration-200 ${
                  currentPage === Math.ceil(questions.length / questionsPerPage)
                    ? 'text-gray-400 cursor-not-allowed hover:scale-100'
                    : 'text-[#192A41] hover:text-[#C0A063] hover:bg-gray-100'
                }`}
              >
                {'>'}
              </button>
            </div>
          </div>
        )}
      </main>
      
      {/* Normal Explanation Modal */}
      {showExplanationModal && currentQuestionForExplanation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative w-full h-full max-h-screen flex items-center justify-center p-4 sm:p-6">
            <div 
              ref={explanationModalRef}
              className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white rounded-lg shadow-xl transition-all duration-300 ease-out flex flex-col max-h-[90vh] sm:max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-lg font-bold text-[#192A41] flex items-center gap-2">
                  <Eye className="h-5 w-5 text-[#C0A063]" />
                  Explanation
                </h3>
                <button
                  onClick={closeExplanationModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer transform hover:scale-110"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <div className="space-y-3">
                  {currentQuestionForExplanation.question.explanation && (
                    <div className="text-gray-700 text-base leading-relaxed">
                      <div
                        className="quill-content"
                        dangerouslySetInnerHTML={{ __html: currentQuestionForExplanation.question.explanation }}
                      />
                    </div>
                  )}

                  {!currentQuestionForExplanation.question.explanation && (
                    <div className="text-gray-500 text-center py-3">
                      <p>No explanation available for this question.</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 pt-3 border-t border-gray-200 flex-shrink-0">
                <div className="flex justify-end">
                  <button
                    onClick={closeExplanationModal}
                    className="px-5 py-2.5 bg-[#C0A063] text-white rounded-full hover:bg-opacity-90 transition duration-300 font-semibold cursor-pointer transform hover:scale-105"
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
              className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white rounded-lg shadow-xl transition-all duration-300 ease-out flex flex-col max-h-[90vh] sm:max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-lg font-bold text-[#192A41] flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-[#C0A063]" />
                  Owl AI Explanation
                </h3>
                <button
                  onClick={closeAIModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer transform hover:scale-110"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
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
                    onClick={closeAIModal}
                    className="px-5 py-2.5 bg-gray-200 text-[#192A41] rounded-full hover:bg-gray-300 transition duration-300 font-semibold cursor-pointer transform hover:scale-105 whitespace-nowrap"
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

