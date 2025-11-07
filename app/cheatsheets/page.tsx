'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Search, Star, FileText, ArrowRight, Filter, Grid, List } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

interface Cheatsheet {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  tags?: string[];
  color?: string;
  featured?: boolean;
}

function Cheatsheets() {
  const [cheatsheets, setCheatsheets] = useState<Cheatsheet[]>([]);
  const [allCheatsheets, setAllCheatsheets] = useState<Cheatsheet[]>([]);
  const [featuredSheets, setFeaturedSheets] = useState<Cheatsheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({ category: '', search: '' });
  const [categories, setCategories] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      
      try {
        await Promise.all([
          fetchAllCheatsheets(),
          fetchFeaturedSheets(),
          fetchCategories()
        ]);
      } catch (error) {
        setError('Failed to load cheatsheets');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    filterCheatsheets();
  }, [filters, allCheatsheets]);

  const filterCheatsheets = () => {
    let filtered = [...allCheatsheets];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(sheet => 
        sheet.title.toLowerCase().includes(searchTerm) ||
        sheet.description?.toLowerCase().includes(searchTerm) ||
        sheet.category.toLowerCase().includes(searchTerm) ||
        sheet.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.category) {
      filtered = filtered.filter(sheet => sheet.category === filters.category);
    }

    setCheatsheets(filtered);
  };

  const fetchAllCheatsheets = async () => {
    try {
      const response = await axiosInstance.get('/api/cheatsheets/all?limit=100');
      setAllCheatsheets(response.data.cheatsheets || []);
    } catch (error) {
      setError('Failed to load cheatsheets');
    }
  };

  const fetchFeaturedSheets = async () => {
    try {
      const response = await axiosInstance.get('/api/cheatsheets/featured/list');
      setFeaturedSheets(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/api/cheatsheets/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheatsheetClick = (slug: string) => {
    router.push(`/cheatsheets/${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div 
            className="rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#C0A063] mx-auto mb-6 animate-spin"
          ></div>
          <p className="text-[#192A41] text-lg font-semibold">Loading cheatsheets...</p>
          <p className="text-gray-600 text-sm mt-2">Preparing your learning journey</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-full p-4 inline-block mb-6">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#192A41] mb-3">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#C0A063] text-white font-semibold px-8 py-3 rounded-full hover:bg-opacity-90 transition duration-300 text-lg shadow-md hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="border-b border-gray-200 bg-white mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Header */}
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 bg-[#FEF3E2] text-[#C0A063]">
              <FileText className="w-3.5 h-3.5" />
              <span>Study Resources</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight inline-block">
              <span className="text-[#192A41]">Quick Reference </span>
              <span className="text-[#C0A063]">Cheatsheets</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              Fast access to formulas, concepts, programming syntax, and essential shortcuts for competitive exams, developer resources, and more. Everything you need in one place.
            </p>
          </div>
          
          {/* Search */}
          <div className="max-w-2xl">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm focus-within:border-gray-300 transition-colors">
              <div className="flex items-center px-4 py-3">
                <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search cheatsheets..."
                  className="flex-1 px-4 py-1 outline-none text-sm text-gray-900 placeholder-gray-500"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setFilters(prev => ({ ...prev, search: e.target.value }));
                  }}
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`ml-2 p-2 rounded-lg hover:bg-gray-100 transition-colors ${showFilters ? 'text-[#C0A063]' : 'text-gray-500'}`}
                >
                  <Filter className="h-5 w-5" />
                </button>
              </div>
              
              {showFilters && (
                <div className="border-t border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Category</span>
                    {filters.category && (
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                        className="text-xs font-medium hover:underline text-[#C0A063]"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFilters(prev => ({ ...prev, category: prev.category === cat ? '' : cat }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          filters.category === cat 
                            ? 'bg-[#C0A063] text-white border-none' 
                            : 'bg-gray-50 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      {featuredSheets.length > 0 && !filters.search && (
        <section className="py-10 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#192A41]">
                Featured Cheatsheets
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {featuredSheets.map((sheet) => (
                <div
                  key={sheet._id}
                  onClick={() => handleCheatsheetClick(sheet.slug)}
                  className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.06)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.1)]"
                  style={{
                    borderColor: sheet.color ? `${sheet.color}40` : 'rgba(0,0,0,0.06)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = sheet.color || '#C0A063';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = sheet.color ? `${sheet.color}40` : 'rgba(0,0,0,0.06)';
                  }}
                >
                  {/* Top accent */}
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: sheet.color || '#C0A063' }} />
                  
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Icon & Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF3E2] text-[#C0A063]">
                        <Star className="w-3 h-3" fill="currentColor" />
                        <span>Featured</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-2 line-clamp-2 transition-colors group-hover:opacity-80 text-[#192A41]">
                      {sheet.title}
                    </h3>

                    {/* Category */}
                    <span className="inline-block px-3 py-1 rounded-lg text-xs font-medium mb-3 max-w-fit bg-gray-100 text-[#192A41]">
                      {sheet.category}
                    </span>

                    {/* Description */}
                    {sheet.description && (
                      <p className="text-sm text-gray-800 mb-4 line-clamp-2 leading-relaxed">{sheet.description}</p>
                    )}

                    {/* Footer - Always at bottom */}
                    <div className="mt-auto pt-4">
                      {/* Tags */}
                      {sheet.tags && sheet.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-100">
                          {sheet.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-xs px-2.5 py-1 rounded-md font-medium bg-gray-50 text-gray-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="mb-4 pb-4 border-b border-gray-100"></div>
                      )}

                      {/* CTA */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#C0A063]">
                          View Details
                        </span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 text-[#C0A063]" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Cheatsheets */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-[#192A41]">
                All Cheatsheets
              </h2>
              <p className="text-sm text-gray-700">
                {cheatsheets.length} {cheatsheets.length === 1 ? 'result' : 'results'}
              </p>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid' ? 'bg-[#C0A063] text-white' : 'bg-transparent text-gray-500'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list' ? 'bg-[#C0A063] text-white' : 'bg-transparent text-gray-500'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {cheatsheets.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-xl bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[#192A41]">No results found</h3>
              <p className="text-sm text-gray-800 mb-6">Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  setFilters({ category: '', search: '' });
                  setSearchInput('');
                }}
                className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 bg-[#C0A063]"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto'
              : 'space-y-4'
            }>
              {cheatsheets.map((sheet) => (
                viewMode === 'grid' ? (
                  <div
                    key={sheet._id}
                    onClick={() => handleCheatsheetClick(sheet.slug)}
                    className="group relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-0.5 flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.06)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
                    style={{
                      borderColor: sheet.color ? `${sheet.color}40` : 'rgba(0,0,0,0.06)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = sheet.color || '#C0A063';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = sheet.color ? `${sheet.color}40` : 'rgba(0,0,0,0.06)';
                    }}
                  >
                    {/* Top accent */}
                    <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: sheet.color || '#C0A063' }} />
                    
                    <div className="p-5 flex flex-col flex-grow">
                      {/* Icon */}
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${sheet.color || '#C0A063'}15` }}
                      >
                        <FileText className="w-5 h-5" style={{ color: sheet.color || '#C0A063' }} />
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold mb-3 line-clamp-2 transition-colors group-hover:opacity-80 text-[#192A41]">
                        {sheet.title}
                      </h3>
                      
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-[#192A41]">
                          {sheet.category}
                        </span>
                        {sheet.featured && (
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 bg-[#FEF3E2] text-[#C0A063]">
                            <Star className="w-3 h-3" fill="currentColor" />
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {sheet.description && (
                        <p className="text-xs text-gray-800 mb-3 line-clamp-2 leading-relaxed">{sheet.description}</p>
                      )}

                      {/* Footer - Always at bottom */}
                      <div className="mt-auto pt-4">
                        {/* Tags */}
                        {sheet.tags && sheet.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 mb-4 pb-4 border-b border-gray-100">
                            {sheet.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="text-xs px-2 py-0.5 rounded font-medium bg-gray-50 text-gray-600">
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="mb-4 pb-4 border-b border-gray-100"></div>
                        )}

                        {/* CTA */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#C0A063]">
                            View
                          </span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#C0A063]" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={sheet._id}
                    onClick={() => handleCheatsheetClick(sheet.slug)}
                    className="group relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.06)] border-l-[3px] hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
                    style={{
                      borderLeftColor: sheet.color || '#C0A063'
                    }}
                  >
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        {/* Icon */}
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${sheet.color || '#C0A063'}15` }}
                        >
                          <FileText className="w-6 h-6" style={{ color: sheet.color || '#C0A063' }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start gap-2 mb-2">
                            <h3 className="text-lg font-bold transition-colors group-hover:opacity-80 text-[#192A41]">
                              {sheet.title}
                            </h3>
                            <span className="px-3 py-1 rounded-lg text-xs font-medium shrink-0 bg-gray-100 text-[#192A41]">
                              {sheet.category}
                            </span>
                            {sheet.featured && (
                              <span className="px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0 bg-[#FEF3E2] text-[#C0A063]">
                                <Star className="w-3 h-3" fill="currentColor" />
                                Featured
                              </span>
                            )}
                          </div>
                          
                          {sheet.description && (
                            <p className="text-sm text-gray-800 mb-3 line-clamp-2">{sheet.description}</p>
                          )}
                          
                          {sheet.tags && sheet.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {sheet.tags.map((tag, idx) => (
                                <span key={idx} className="text-xs px-2.5 py-1 rounded-md font-medium bg-gray-50 text-gray-600">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* View Details at bottom - right aligned */}
                      <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                        <span className="text-sm font-semibold text-[#C0A063]">
                          View Details
                        </span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 text-[#C0A063]" />
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Cheatsheets;

