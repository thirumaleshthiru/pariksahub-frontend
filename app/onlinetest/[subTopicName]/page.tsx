'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Timer, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';
 

interface QuestionItem {
  question: {
    _id: string;
    question: string;
    answer: string;
    question_image_url?: string;
  };
  options: {
    _id: string;
    option_text: string;
    option_type: string;
    path_url?: string;
  }[];
}

function OnlineTest() {
  const params = useParams();
  const router = useRouter();
  const subTopicName = params.subTopicName as string;
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number; answered: number; percentage: number } | null>(null);

  // Use refs to store latest values for timer
  const questionsRef = useRef<QuestionItem[]>([]);
  const answersRef = useRef<Record<string, string>>({});

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (subTopicName) {
      fetchQuestions();
    }
  }, [subTopicName]);

  useEffect(() => {
    if (timeLeft > 0 && !isFinished && questions.length > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Calculate score when timer expires using refs
            let correct = 0;
            let answered = 0;
            questionsRef.current.forEach(item => {
              const selectedOptionId = answersRef.current[item.question._id];
              if (selectedOptionId) {
                answered++;
                const selectedOption = item.options.find(opt => opt._id === selectedOptionId);
                if (selectedOption && selectedOption.option_text === item.question.answer) {
                  correct++;
                }
              }
            });
            setScore({
              correct,
              total: questionsRef.current.length,
              answered,
              percentage: questionsRef.current.length ? Math.round((correct / questionsRef.current.length) * 100) : 0
            });
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isFinished, questions.length]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/questions/subtopic/${subTopicName}`);
      setQuestions(response.data);
      setError('');
    } catch (error) {
      setError('Failed to load questions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const submitTest = () => {
    let correct = 0;
    let answered = 0;
    questions.forEach(item => {
      const selectedOptionId = answers[item.question._id];
      if (selectedOptionId) {
        answered++;
        const selectedOption = item.options.find(opt => opt._id === selectedOptionId);
        if (selectedOption && selectedOption.option_text === item.question.answer) {
          correct++;
        }
      }
    });
    setScore({
      correct,
      total: questions.length,
      answered,
      percentage: questions.length ? Math.round((correct / questions.length) * 100) : 0
    });
    setIsFinished(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center pt-20">
        <div className="relative">
          <div 
            className="w-16 h-16 border-4 border-gray-200 border-t-[#C0A063] rounded-full animate-spin"
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-[#C0A063] rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center p-4 pt-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-gray-700 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (isFinished && score) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 p-4 pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Score Summary */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8 mb-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl font-bold">{score.percentage}%</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Test Complete!</h2>
            <div className="text-slate-600 mb-8 text-lg">
              You got {score.correct} out of {score.answered} answered questions correct
            </div>
            <div className="text-slate-500 mb-8 text-sm">
              {score.total - score.answered} questions were skipped
            </div>
            <Link
              href="/test-topics"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-900 to-amber-600 text-white rounded-xl font-semibold text-lg hover:from-blue-800 hover:to-amber-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Back to Topics
            </Link>
          </div>

          {/* Detailed Results */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">Question Review</h3>
            <div className="space-y-4">
              {questions.map((item, index) => {
                const selectedOptionId = answers[item.question._id];
                const selectedOption = item.options.find(opt => opt._id === selectedOptionId);
                const isAnswered = !!selectedOptionId;
                const isCorrect = selectedOption && selectedOption.option_text === item.question.answer;
                
                return (
                  <div key={item.question._id} className={`p-4 rounded-xl border-2 ${
                    !isAnswered
                      ? 'bg-yellow-50 border-yellow-200'
                      : isCorrect 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        !isAnswered 
                          ? 'bg-yellow-500' 
                          : isCorrect 
                            ? 'bg-green-500' 
                            : 'bg-red-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="text-lg font-medium text-slate-800 quill-content"
                            dangerouslySetInnerHTML={{ __html: item.question.question }} 
                          />
                          {!isAnswered && (
                            <span className="text-yellow-600 font-semibold text-sm bg-yellow-100 px-2 py-1 rounded-full">
                              ⚠ Skipped
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          {item.options.map((option) => {
                            const isSelected = selectedOptionId === option._id;
                            const isCorrectOption = option.option_text === item.question.answer;
                            
                            return (
                              <div key={option._id} className={`p-3 rounded-lg border ${
                                isCorrectOption 
                                  ? 'bg-green-100 border-green-300 text-green-800 font-medium' 
                                  : isSelected 
                                    ? 'bg-red-100 border-red-300 text-red-800' 
                                    : 'bg-gray-50 border-gray-200 text-gray-600'
                              }`}>
                                <div className="flex items-center gap-2">
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                    isCorrectOption 
                                      ? 'bg-green-500 text-white' 
                                      : isSelected 
                                        ? 'bg-red-500 text-white' 
                                        : 'bg-gray-300 text-gray-600'
                                  }`}>
                                    {String.fromCharCode(65 + item.options.indexOf(option))}
                                  </span>
                                  <span 
                                    className="quill-content"
                                    dangerouslySetInnerHTML={{ __html: option.option_text }} 
                                  />
                                  {isCorrectOption && (
                                    <span className="text-green-600 font-semibold text-sm">✓ Correct</span>
                                  )}
                                  {isSelected && !isCorrectOption && (
                                    <span className="text-red-600 font-semibold text-sm">✗ Your Answer</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center p-4 pt-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No Questions Available</h2>
          <p className="text-gray-600 mb-6">Questions will appear here once they are added for this subtopic.</p>
          <Link
            href="/test-topics"
            className="inline-block px-6 py-2 bg-gradient-to-r from-blue-900 to-amber-600 text-white rounded-lg font-semibold hover:from-blue-800 hover:to-amber-700 transition-all"
          >
            Back to Topics
          </Link>
        </div>
      </div>
    );
  }

  const item = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center p-2 sm:p-4 pt-20 sm:pt-4">
      <div className="w-full max-w-4xl">
        {/* Single Card Container - Responsive Height */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 flex flex-col max-h-[85vh] sm:max-h-[85vh]">
          {/* Header - Fixed Height */}
          <div className="bg-[#192A41] rounded-t-2xl p-3 sm:p-4 flex-shrink-0">
            <div className="flex justify-between items-center text-white">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#C0A063] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{currentQuestionIndex + 1}</span>
                </div>
                <div>
                  <div className="text-sm font-medium">Question {currentQuestionIndex + 1} of {questions.length}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 px-2 sm:px-3 py-1 rounded-lg">
                <Timer className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-mono text-xs sm:text-sm">{formatTime(timeLeft)}</span>
              </div>
            </div>
            <div className="mt-2 bg-white/20 rounded-full h-1.5">
              <div 
                className="bg-white rounded-full h-1.5 transition-all duration-500"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Content Area - Flexible Height with Better Mobile Spacing */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
            <div 
              className="text-lg sm:text-xl font-medium text-slate-800 mb-4 sm:mb-6 leading-relaxed bg-gradient-to-r from-blue-50 to-amber-50 p-4 sm:p-6 rounded-xl border-l-4 border-blue-900 shadow-lg text-[1.125rem] quill-content" 
              dangerouslySetInnerHTML={{ __html: item.question.question }} 
            />
            {item.question.question_image_url && (
              <div className="mb-3 sm:mb-4">
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${item.question.question_image_url}`}
                  alt="Question"
                  className="max-w-full h-auto rounded-xl shadow-lg border border-gray-200"
                />
              </div>
            )}
            <div className="space-y-2">
              {item.options.map((option, index) => (
                <button
                  key={option._id}
                  onClick={() => handleAnswer(item.question._id, option._id)}
                  className={`group w-full p-2 text-left rounded-xl border-2 transition-all duration-200 ${
                    answers[item.question._id] === option._id
                      ? 'border-blue-900 bg-gradient-to-r from-blue-50 to-amber-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all flex-shrink-0 ${
                      answers[item.question._id] === option._id
                        ? 'bg-gradient-to-r from-blue-900 to-amber-600 text-white'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {option.option_type === 'text' ? (
                        <span 
                          className="text-slate-700 text-sm sm:text-base block font-normal quill-content"
                          dangerouslySetInnerHTML={{ __html: option.option_text }} 
                        />
                      ) : (
                        <>
                          {option.option_text && <span className="text-slate-700 text-sm sm:text-base block mb-2 font-normal">{option.option_text}</span>}
                          {option.path_url && (
                            <img 
                              src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${option.path_url}`}
                              alt="Option"
                              className="max-w-full sm:max-w-xs h-auto rounded-lg border border-gray-200"
                            />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Navigation - Fixed at Bottom */}
          <div className="bg-gray-50 px-3 sm:px-4 py-3 flex justify-between items-center flex-shrink-0 border-t border-gray-200 rounded-b-2xl">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-slate-600 disabled:text-gray-400 disabled:cursor-not-allowed hover:text-blue-900 transition-colors font-medium text-sm sm:text-base cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={submitTest}
                className="flex items-center space-x-1 sm:space-x-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-900 to-amber-600 text-white rounded-lg font-medium hover:from-blue-800 hover:to-amber-700 transform hover:scale-105 transition-all duration-200 shadow-lg text-sm sm:text-base cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Submit Test</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-slate-600 hover:text-blue-900 transition-colors font-medium text-sm sm:text-base cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnlineTest;

