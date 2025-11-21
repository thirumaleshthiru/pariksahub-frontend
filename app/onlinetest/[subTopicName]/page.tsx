'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Timer, ChevronLeft, ChevronRight, Send, Check, X } from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';
import { formatDisplayText } from '../../../utils/textUtils';
 

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
  const subTopicNameRef = useRef<string>('');

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    subTopicNameRef.current = subTopicName;
  }, [subTopicName]);

  // Save test result function - defined early so it can be used in timer
  const saveTestResult = async (topicName: string, score: { correct: number; total: number; answered: number; percentage: number }) => {
    if (!topicName) {
      console.log('No topic name provided for test result');
      return;
    }
    
    try {
      const response = await axiosInstance.get('/api/student/profile');
      if (response.status === 200) {
        // User is logged in, save test result
        const saveResponse = await axiosInstance.post('/api/student/save-test-result', {
          subTopicName: topicName,
          score: score
        });
        console.log('Test result saved successfully:', saveResponse.data);
      }
    } catch (err: any) {
      // Not logged in or error, skip saving
      if (err.response?.status === 401) {
        console.log('User not logged in, skipping test result save');
      } else {
        console.error('Error saving test result:', err);
      }
    }
  };

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
            const testScore = {
              correct,
              total: questionsRef.current.length,
              answered,
              percentage: questionsRef.current.length ? Math.round((correct / questionsRef.current.length) * 100) : 0
            };
            setScore(testScore);
            setIsFinished(true);
            
            // Save test result to database if logged in
            saveTestResult(subTopicNameRef.current, testScore);
            
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

  const submitTest = async () => {
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
    const testScore = {
      correct,
      total: questions.length,
      answered,
      percentage: questions.length ? Math.round((correct / questions.length) * 100) : 0
    };
    setScore(testScore);
    setIsFinished(true);
    
    // Save test result to database if logged in
    saveTestResult(subTopicName, testScore);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center pt-20">
        <div className="relative">
          <div 
            className="w-16 h-16 border-4 border-gray-800 border-t-[#6366F1] rounded-full animate-spin"
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-[#6366F1] rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-2xl p-4 inline-block mb-4">
            <AlertCircle className="h-10 w-10 text-red-500" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Something Went Wrong</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            href="/test-topics"
            className="bg-[#6366F1] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#5558E3] transition duration-300 inline-block"
            aria-label="Go back to test topics"
          >
            Back to Topics
          </Link>
        </div>
      </div>
    );
  }

  if (isFinished && score) {
    return (
      <div className="min-h-screen bg-[#0A0E27] text-white p-4 pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Score Summary */}
          <div className="bg-[#161B33] border border-gray-700 rounded-2xl shadow-lg shadow-[#6366F1]/20 p-8 mb-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl font-bold">{score.percentage}%</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Test Complete!</h2>
            <div className="text-gray-300 mb-8 text-lg">
              You got {score.correct} out of {score.answered} answered questions correct
            </div>
            <div className="text-gray-400 mb-8 text-sm">
              {score.total - score.answered} questions were skipped
            </div>
            <Link
              href="/test-topics"
              className="inline-block px-8 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-xl font-semibold text-lg hover:from-[#5558E3] hover:to-[#7C3AED] transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Back to Topics
            </Link>
          </div>

          {/* Detailed Results */}
          <div className="bg-[#161B33] border border-gray-700 rounded-2xl shadow-lg shadow-[#6366F1]/20 p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Question Review</h3>
            <div className="space-y-4">
              {questions.map((item, index) => {
                const selectedOptionId = answers[item.question._id];
                const selectedOption = item.options.find(opt => opt._id === selectedOptionId);
                const isAnswered = !!selectedOptionId;
                const isCorrect = selectedOption && selectedOption.option_text === item.question.answer;
                
                return (
                  <div key={item.question._id} className={`p-4 rounded-xl border-2 ${
                    !isAnswered
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : isCorrect 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
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
                            className="text-lg font-medium text-white quill-content"
                            dangerouslySetInnerHTML={{ __html: item.question.question }} 
                          />
                          {!isAnswered && (
                            <span className="text-yellow-400 font-semibold text-sm bg-yellow-500/20 px-2 py-1 rounded-full border border-yellow-500/30">
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
                                  ? 'bg-green-500/10 border-green-500/30 text-green-300 font-medium' 
                                  : isSelected 
                                    ? 'bg-red-500/10 border-red-500/30 text-red-300' 
                                    : 'bg-gray-800/50 border-gray-700 text-gray-400'
                              }`}>
                                <div className="flex items-center gap-2">
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                    isCorrectOption 
                                      ? 'bg-green-500 text-white' 
                                      : isSelected 
                                        ? 'bg-red-500 text-white' 
                                        : 'bg-gray-700 text-gray-400'
                                  }`}>
                                    {String.fromCharCode(65 + item.options.indexOf(option))}
                                  </span>
                                  <span 
                                    className="quill-content flex-1"
                                    dangerouslySetInnerHTML={{ __html: option.option_text }} 
                                  />
                                  {isCorrectOption && (
                                    <span className="text-green-400 font-semibold text-sm flex items-center gap-1">
                                      <Check className="w-4 h-4" /> Correct
                                    </span>
                                  )}
                                  {isSelected && !isCorrectOption && (
                                    <span className="text-red-400 font-semibold text-sm flex items-center gap-1">
                                      <X className="w-4 h-4" /> Your Answer
                                    </span>
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
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-gray-800 rounded-full p-4 inline-block mb-4">
            <AlertCircle className="h-10 w-10 text-gray-400" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No Questions Available</h2>
          <p className="text-gray-400 mb-6">Questions will appear here once they are added for this subtopic.</p>
          <Link
            href="/test-topics"
            className="inline-block px-6 py-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-lg font-semibold hover:from-[#5558E3] hover:to-[#7C3AED] transition-all"
          >
            Back to Topics
          </Link>
        </div>
      </div>
    );
  }

  const item = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white flex items-center justify-center p-2 sm:p-4 pt-20 sm:pt-4">
      <div className="w-full max-w-4xl">
        {/* Single Card Container - Responsive Height */}
        <div className="bg-[#161B33] border border-gray-700 rounded-2xl shadow-lg shadow-[#6366F1]/20 flex flex-col max-h-[85vh] sm:max-h-[85vh]">
          {/* Header - Fixed Height */}
          <div className="bg-[#1a1f3a] border-b border-gray-700 rounded-t-2xl p-3 sm:p-4 flex-shrink-0">
            <h1 className="text-lg sm:text-xl font-bold text-white mb-2 text-center">Online Test - {formatDisplayText(subTopicName)}</h1>
            <div className="flex justify-between items-center text-white">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#6366F1] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{currentQuestionIndex + 1}</span>
                </div>
                <div>
                  <h2 className="text-sm font-medium">Question {currentQuestionIndex + 1} of {questions.length}</h2>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-[#161B33] border border-gray-700 px-2 sm:px-3 py-1 rounded-lg">
                <Timer className="h-3 w-3 sm:h-4 sm:w-4 text-[#6366F1]" />
                <span className="font-mono text-xs sm:text-sm text-white">{formatTime(timeLeft)}</span>
              </div>
            </div>
            <div className="mt-2 bg-gray-800 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full h-1.5 transition-all duration-500"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Content Area - Flexible Height with Better Mobile Spacing */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
            <div 
              className="text-lg sm:text-xl font-medium text-white mb-4 sm:mb-6 leading-relaxed bg-[#1a1f3a] border border-gray-700 p-4 sm:p-6 rounded-xl border-l-4 border-l-[#6366F1] shadow-lg text-[1.125rem] quill-content" 
              dangerouslySetInnerHTML={{ __html: item.question.question }} 
            />
            {item.question.question_image_url && (
              <div className="mb-3 sm:mb-4">
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${item.question.question_image_url}`}
                  alt="Question"
                  className="max-w-full h-auto rounded-xl shadow-lg border border-gray-700"
                />
              </div>
            )}
            <div className="space-y-2">
              {item.options.map((option, index) => (
                <button
                  key={option._id}
                  onClick={() => handleAnswer(item.question._id, option._id)}
                  className={`group w-full p-3 text-left rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    answers[item.question._id] === option._id
                      ? 'border-[#6366F1] bg-[#6366F1]/10 shadow-lg shadow-[#6366F1]/20'
                      : 'border-gray-700 bg-[#1a1f3a] hover:border-[#6366F1]/50 hover:bg-[#6366F1]/5 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all flex-shrink-0 ${
                      answers[item.question._id] === option._id
                        ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white'
                        : 'bg-gray-700 text-gray-400 group-hover:bg-gray-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {option.option_type === 'text' ? (
                        <span 
                          className="text-white text-sm sm:text-base block font-normal quill-content"
                          dangerouslySetInnerHTML={{ __html: option.option_text }} 
                        />
                      ) : (
                        <>
                          {option.option_text && <span className="text-white text-sm sm:text-base block mb-2 font-normal">{option.option_text}</span>}
                          {option.path_url && (
                            <img 
                              src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${option.path_url}`}
                              alt="Option"
                              className="max-w-full sm:max-w-xs h-auto rounded-lg border border-gray-700"
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
          <div className="bg-[#1a1f3a] border-t border-gray-700 px-3 sm:px-4 py-3 flex justify-between items-center flex-shrink-0 rounded-b-2xl">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed hover:text-white transition-colors font-medium text-sm sm:text-base cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={submitTest}
                className="flex items-center space-x-1 sm:space-x-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-lg font-medium hover:from-[#5558E3] hover:to-[#7C3AED] transform hover:scale-105 transition-all duration-200 shadow-lg text-sm sm:text-base cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Submit Test</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-gray-400 hover:text-white transition-colors font-medium text-sm sm:text-base cursor-pointer"
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
