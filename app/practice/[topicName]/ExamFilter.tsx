'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { formatDisplayText } from '../../../utils/textUtils';

interface Exam {
  _id: string;
  exam_name: string;
}

interface ExamFilterProps {
  topicName: string;
  exams: Exam[];
  selectedExam: string;
  search?: string;
}

export default function ExamFilter({ topicName, exams, selectedExam, search }: ExamFilterProps) {
  const handleExamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const examValue = e.target.value;
    const params = new URLSearchParams();
    
    if (examValue) {
      params.set('exam', examValue);
    }
    
    if (search) {
      params.set('search', search);
    }
    
    const queryString = params.toString();
    const url = `/practice/${topicName}${queryString ? `?${queryString}` : ''}`;
    // Use window.location for full page reload to ensure server component re-renders
    window.location.href = url;
  };

  return (
    <div className="relative">
      <div className="relative">
        <select
          value={selectedExam}
          onChange={handleExamChange}
          className="bg-[#161B33] border border-gray-800 rounded-lg px-4 py-2.5 min-w-[180px] text-left text-white text-sm appearance-none cursor-pointer hover:border-[#6366F1] transition-colors pr-8 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
          aria-label="Filter subtopics by exam type"
        >
          <option value="">All Exams</option>
          {exams.map((exam) => (
            <option key={exam._id} value={exam.exam_name}>
              {formatDisplayText(exam.exam_name).toUpperCase()}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" aria-hidden="true" />
      </div>
    </div>
  );
}

