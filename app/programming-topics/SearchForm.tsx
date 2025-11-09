'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface SearchFormProps {
  search?: string;
  category?: string;
  categories?: string[];
}

export default function SearchForm({ search, category, categories = [] }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(search || '');
  const [selectedCategory, setSelectedCategory] = useState(category || '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    }
    
    if (selectedCategory) {
      params.set('category', selectedCategory);
    }

    const queryString = params.toString();
    router.push(`/programming-topics${queryString ? `?${queryString}` : ''}`);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedCategory('');
    router.push('/programming-topics');
  };

  const hasFilters = searchTerm || selectedCategory;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search programming topics..."
            className="w-full pl-12 pr-4 py-3 bg-[#161B33] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#6366F1] transition-colors"
            aria-label="Search programming topics"
          />
        </div>
        
        {categories.length > 0 && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-48 px-4 py-3 bg-[#161B33] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#6366F1] transition-colors"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-6 py-3 bg-[#6366F1] hover:bg-[#5558E3] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            aria-label="Search"
          >
            <Search className="w-5 h-5" aria-hidden="true" />
            <span className="hidden sm:inline">Search</span>
          </button>
          
          {hasFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-3 bg-[#161B33] hover:bg-[#1a1f3a] border border-gray-700 text-white rounded-xl transition-colors flex items-center justify-center"
              aria-label="Clear filters"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

