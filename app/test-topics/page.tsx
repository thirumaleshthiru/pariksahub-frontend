'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { formatDisplayText } from '../../utils/textUtils';

interface Topic {
  _id: string;
  topic_name: string;
}

function TestTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/topics/all');
      setTopics(response.data);
    } catch (error) {
      setError('Failed to load topics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topicName: string) => {
    router.push(`/test-topics/${topicName}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center pt-20">
        <div className="relative">
          <div className="w-12 h-12 border-3 border-slate-200 border-t-slate-700 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-orange-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center p-4 pt-20">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-slate-700 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-12 text-center">Select a Topic</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <button
              key={topic._id}
              onClick={() => handleTopicClick(topic.topic_name)}
              className="group relative p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-orange-300 transition-all duration-300 text-left w-full hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-600/5 to-orange-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h3 className="relative text-xl font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                {formatDisplayText(topic.topic_name)}
              </h3>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-slate-600 to-orange-400 group-hover:w-full transition-all duration-300"></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TestTopics;

