'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { formatDisplayText } from '../../../utils/textUtils';

interface Subtopic {
  _id: string;
  subtopic_name: string;
}

interface TestSubtopicCardProps {
  subtopic: Subtopic;
  index?: number;
}

export default function TestSubtopicCard({ subtopic, index = 0 }: TestSubtopicCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/onlinetest/${subtopic.subtopic_name}`);
  };

  return (
    <button
      onClick={handleClick}
      className="group relative bg-[#161B33] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col border border-gray-700 hover:border-[#6366F1] shadow-lg shadow-[#6366F1]/20 hover:shadow-2xl hover:shadow-[#6366F1]/50 min-h-[200px] text-left w-full"
      aria-label={`Start online test for ${formatDisplayText(subtopic.subtopic_name)}`}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/10 via-transparent to-[#EC4899]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative p-6 flex flex-col flex-grow">
        {/* Index Number */}
        <div className="absolute top-4 right-4 text-5xl font-black text-white opacity-5 group-hover:opacity-10 transition-opacity">
          {String(index + 1).padStart(2, '0')}
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold mb-auto line-clamp-3 leading-snug relative z-10 pr-8">
          {formatDisplayText(subtopic.subtopic_name)}
        </h3>

        {/* Footer */}
        <div className="mt-5 flex justify-between items-center relative z-10">
          <span className="text-sm font-bold text-[#6366F1] group-hover:text-[#8B5CF6] transition-colors">
            Start Test
          </span>
          <div className="w-10 h-10 bg-[#6366F1] group-hover:bg-gradient-to-br group-hover:from-[#6366F1] group-hover:to-[#8B5CF6] flex items-center justify-center transition-all duration-300 group-hover:rotate-45 rounded-lg">
            <ArrowUpRight className="w-5 h-5 text-white transition-all duration-300" aria-hidden="true" />
          </div>
        </div>
      </div>
    </button>
  );
}

