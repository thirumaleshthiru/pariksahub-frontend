 
import Link from 'next/link';
import { AlertCircle, Star, FileText, ArrowRight } from 'lucide-react';
import { fetchFromApi } from '../../utils/serverApi';
import SearchForm from './SearchForm';

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

interface CheatsheetsPageProps {
  searchParams: Promise<{ search?: string; category?: string }>;
}

async function getAllCheatsheets(): Promise<Cheatsheet[]> {
  try {
    const data = await fetchFromApi('/api/cheatsheets/all?limit=100') as { cheatsheets?: Cheatsheet[] };
    return data.cheatsheets || [];
  } catch (error) {
    console.error('Error fetching cheatsheets:', error);
    throw new Error('Failed to load cheatsheets');
  }
}

async function getFeaturedSheets(): Promise<Cheatsheet[]> {
  try {
    const data = await fetchFromApi('/api/cheatsheets/featured/list') as Cheatsheet[];
    return data || [];
  } catch (error) {
    console.error('Error fetching featured cheatsheets:', error);
    return [];
  }
}

async function getCategories(): Promise<string[]> {
  try {
    const data = await fetchFromApi('/api/cheatsheets/categories') as { categories?: string[] };
    return data.categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

function filterCheatsheets(cheatsheets: Cheatsheet[], search?: string, category?: string): Cheatsheet[] {
  let filtered = [...cheatsheets];

  if (search) {
    const searchTerm = search.toLowerCase();
    filtered = filtered.filter(sheet => 
      sheet.title.toLowerCase().includes(searchTerm) ||
      sheet.description?.toLowerCase().includes(searchTerm) ||
      sheet.category.toLowerCase().includes(searchTerm) ||
      sheet.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  if (category) {
    filtered = filtered.filter(sheet => sheet.category === category);
  }

  return filtered;
}

export default async function Cheatsheets({ searchParams }: CheatsheetsPageProps) {
  const { search, category } = await searchParams;

  let allCheatsheets: Cheatsheet[] = [];
  let featuredSheets: Cheatsheet[] = [];
  let categories: string[] = [];
  let error: string | null = null;

  try {
    [allCheatsheets, featuredSheets, categories] = await Promise.all([
      getAllCheatsheets(),
      getFeaturedSheets(),
      getCategories()
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load cheatsheets';
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center p-4">
        <main className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-2xl p-4 inline-block mb-4">
            <AlertCircle className="h-10 w-10 text-red-500" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Something Went Wrong</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            href="/cheatsheets"
            className="bg-[#6366F1] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#5558E3] transition duration-300 inline-block"
            aria-label="Try loading cheatsheets again"
          >
            Try Again
          </Link>
        </main>
      </div>
    );
  }

  const cheatsheets = filterCheatsheets(allCheatsheets, search, category);

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-10 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99, 102, 241) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
        
        {/* Gradient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-[#6366F1] to-transparent rounded-full blur-[100px] opacity-20"></div>
        
        <div className="relative max-w-6xl mx-auto px-6 text-center z-10">
          <div className="inline-block mb-5 px-4 py-1.5 bg-[#6366F1] bg-opacity-10 backdrop-blur-sm border border-[#6366F1] border-opacity-30 rounded-full">
            <span className="text-xs font-bold text-[#ffffff] tracking-wider uppercase">Study Resources</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-5 leading-[1.1] tracking-tight">
            <span className="block">Cheatsheets &</span>
            <span className="block bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899] text-transparent bg-clip-text pb-3">Quick Reference Guides</span>
          </h1>
          
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Fast access to formulas, concepts, programming syntax, and essential shortcuts for competitive exams, developer resources, and more. Everything you need in one place.
          </p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <SearchForm search={search} category={category} categories={categories} />
          </div>
        </div>
      </section>

      {/* Featured Section */}
      {featuredSheets.length > 0 && !search && (
        <section className="relative py-12 bg-gradient-to-b from-[#0A0E27] to-[#1a1f3a]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-8">
              <div className="text-xs font-bold text-[#6366F1] mb-2 tracking-widest uppercase">Featured</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                Featured Cheatsheets
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredSheets.map((sheet, index) => (
                <Link
                  key={sheet._id}
                  href={`/cheatsheets/${sheet.slug}`}
                  className="group relative bg-[#161B33] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col border border-gray-700 hover:border-[#6366F1] shadow-lg shadow-[#6366F1]/20 hover:shadow-2xl hover:shadow-[#6366F1]/50 min-h-[200px]"
                  aria-label={`View ${sheet.title} cheatsheet`}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/10 via-transparent to-[#EC4899]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative p-6 flex flex-col flex-grow">
                    {/* Index Number */}
                    <div className="absolute top-4 right-4 text-5xl font-black text-white opacity-40 group-hover:opacity-50 transition-opacity">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    
                    {/* Featured Badge */}
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold mb-4 max-w-fit bg-[#6366F1] text-white border border-[#6366F1]">
                      <Star className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true" />
                      <span>Featured</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-snug relative z-10 pr-8">
                      {sheet.title}
                    </h3>

                    {/* Category */}
                    <span className="inline-block px-3 py-1 rounded-lg text-xs font-medium mb-3 max-w-fit bg-[#161B33] text-white border border-gray-700">
                      {sheet.category}
                    </span>

                    {/* Description */}
                    {sheet.description && (
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed relative z-10">{sheet.description}</p>
                    )}

                    {/* Footer */}
                    <div className="mt-auto pt-4 relative z-10">
                      {/* Tags */}
                      {sheet.tags && sheet.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-800">
                          {sheet.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-xs px-2.5 py-1 rounded-md font-medium bg-[#161B33] text-white border border-gray-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="mb-4 pb-4 border-b border-gray-800"></div>
                      )}

                      {/* CTA */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#6366F1] group-hover:text-[#8B5CF6] transition-colors">
                          View Details
                        </span>
                        <div className="w-10 h-10 bg-[#6366F1] group-hover:bg-gradient-to-br group-hover:from-[#6366F1] group-hover:to-[#8B5CF6] flex items-center justify-center transition-all duration-300 group-hover:rotate-[-45deg] rounded-lg">
                          <ArrowRight className="w-5 h-5 text-white transition-all duration-300" aria-hidden="true" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Cheatsheets */}
      <section id="results-section" className="relative py-12 bg-gradient-to-b from-[#0A0E27] to-[#1a1f3a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-bold text-[#6366F1] mb-2 tracking-widest uppercase">Available Now</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                {cheatsheets.length} {cheatsheets.length === 1 ? 'Cheatsheet' : 'Cheatsheets'} Ready
              </h2>
            </div>
          </div>
          
          {cheatsheets.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-700 rounded-2xl bg-white bg-opacity-5">
              <div className="w-16 h-16 rounded-xl bg-[#161B33] border border-gray-800 mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">No Results Found</h3>
              <p className="text-sm text-gray-400 mb-6">Try adjusting your search or filters</p>
              <Link
                href="/cheatsheets"
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:bg-[#5558E3] bg-[#6366F1] inline-block"
              >
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {cheatsheets.map((sheet, index) => (
                <Link
                  key={sheet._id}
                  href={`/cheatsheets/${sheet.slug}`}
                  className="group relative bg-[#161B33] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col border border-gray-700 hover:border-[#6366F1] shadow-lg shadow-[#6366F1]/20 hover:shadow-2xl hover:shadow-[#6366F1]/50 min-h-[200px]"
                  aria-label={`View ${sheet.title} cheatsheet`}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/10 via-transparent to-[#EC4899]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative p-6 flex flex-col flex-grow">
                    {/* Index Number */}
                    <div className="absolute top-4 right-4 text-5xl font-black text-white opacity-40 group-hover:opacity-50 transition-opacity">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    
                    {/* Icon */}
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110 bg-[#6366F1]"
                    >
                      <FileText className="w-6 h-6 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-snug relative z-10 pr-8">
                      {sheet.title}
                    </h3>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3 relative z-10">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#161B33] text-white border border-gray-700">
                        {sheet.category}
                      </span>
                      {sheet.featured && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 bg-[#6366F1] text-white border border-[#6366F1]">
                          <Star className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true" />
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {sheet.description && (
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2 leading-relaxed relative z-10">{sheet.description}</p>
                    )}

                    {/* Footer */}
                    <div className="mt-auto pt-4 relative z-10">
                      {/* Tags */}
                      {sheet.tags && sheet.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mb-4 pb-4 border-b border-gray-800">
                          {sheet.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 rounded font-medium bg-[#161B33] text-white border border-gray-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="mb-4 pb-4 border-b border-gray-800"></div>
                      )}

                      {/* CTA */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#6366F1] group-hover:text-[#8B5CF6] transition-colors">
                          View
                        </span>
                        <div className="w-10 h-10 bg-[#6366F1] group-hover:bg-gradient-to-br group-hover:from-[#6366F1] group-hover:to-[#8B5CF6] flex items-center justify-center transition-all duration-300 group-hover:rotate-[-45deg] rounded-lg">
                          <ArrowRight className="w-5 h-5 text-white transition-all duration-300" aria-hidden="true" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-12 sm:py-16 bg-[#0A0E27]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="space-y-6">
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
              This page is a fast reference for topics you revisit often. Each cheatsheet is short, scannable, and focused on the exact facts you need during practice or revision.
            </p>
            
            <div className="bg-[#161B33] border border-gray-800 rounded-xl p-4 sm:p-5">
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                <strong className="text-white">What you'll find:</strong> common math formulas and identities, quick definitions for OS/DBMS/Networks/Compiler Design, core CS notes, and ready-to-use snippets for Python, C/C++, and Java. Most pages include a minimal example and a short "remember" note to avoid typical mistakes.
              </p>
            </div>
            
            <div className="bg-[#161B33] border border-gray-800 rounded-xl p-4 sm:p-5">
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                <strong className="text-white">How to use it:</strong> search for a term, open the sheet, scan the headings, copy what you need, and get back to questions. If a topic is missing or outdated, suggest an update - we keep these pages current based on exam patterns and user requests.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

