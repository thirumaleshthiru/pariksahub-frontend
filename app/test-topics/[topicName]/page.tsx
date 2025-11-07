'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, BookOpen, FileText } from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';
import { formatDisplayText } from '../../../utils/textUtils';

interface Subtopic {
  _id: string;
  subtopic_name: string;
}

function TestSubTopics() {
  const params = useParams();
  const router = useRouter();
  const topicName = params.topicName as string;
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (topicName) {
      fetchSubtopics();
    }
  }, [topicName]);

  const fetchSubtopics = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/subtopics/topicname/${topicName}`);
      setSubtopics(response.data);
    } catch (error) {
      setError('Failed to load subtopics. Please try again later.');
    } finally {
      setLoading(false);
    }
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
        <div className="mb-8">
          <Link 
            href="/test-topics"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors duration-200 mb-6 group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Topics
          </Link>
          <h1 className="text-3xl font-bold text-slate-800 text-center">
            {formatDisplayText(topicName)}
          </h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subtopics.map((subtopic) => (
            <button
              key={subtopic._id}
              onClick={() => router.push(`/onlinetest/${subtopic.subtopic_name}`)}
              className="group relative p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-orange-300 transition-all duration-300 text-left w-full hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-600/5 to-orange-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-orange-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                    {formatDisplayText(subtopic.subtopic_name)}
                  </h3>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-slate-600 to-orange-400 group-hover:w-full transition-all duration-300"></div>
            </button>
          ))}
        </div>

        {subtopics.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Subtopics Available</h3>
            <p className="text-slate-600">Subtopics will appear here once they are added for this topic.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TestSubTopics;

