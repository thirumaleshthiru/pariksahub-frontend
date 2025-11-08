
import Link from 'next/link';
import { AlertCircle, Star, HelpCircle, ArrowRight } from 'lucide-react';
import { fetchFromApi } from '../../utils/serverApi';
import SearchForm from './SearchForm';
 
interface FAQ {
  _id: string;
  topic_title: string;
  slug: string;
  description?: string;
  tags?: string[];
  featured?: boolean;
  views?: number;
}

interface FAQsPageProps {
  searchParams: Promise<{ search?: string }>;
}

async function getAllFAQs(): Promise<FAQ[]> {
  try {
    const data = await fetchFromApi('/api/faqs/all?limit=100') as { faqs?: FAQ[] };
    return data.faqs || [];
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    throw new Error('Failed to load FAQs');
  }
}

async function getFeaturedFAQs(): Promise<FAQ[]> {
  try {
    const data = await fetchFromApi('/api/faqs/featured/list') as FAQ[];
    return data || [];
  } catch (error) {
    console.error('Error fetching featured FAQs:', error);
    return [];
  }
}

function filterFAQs(faqs: FAQ[], search?: string): FAQ[] {
  let filtered = [...faqs];

  if (search) {
    const searchTerm = search.toLowerCase();
    filtered = filtered.filter(faq => 
      faq.topic_title.toLowerCase().includes(searchTerm) ||
      faq.description?.toLowerCase().includes(searchTerm) ||
      faq.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  return filtered;
}

export default async function FAQs({ searchParams }: FAQsPageProps) {
  const { search } = await searchParams;

  let allFAQs: FAQ[] = [];
  let featuredFAQs: FAQ[] = [];
  let error: string | null = null;

  try {
    [allFAQs, featuredFAQs] = await Promise.all([
      getAllFAQs(),
      getFeaturedFAQs()
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load FAQs';
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center p-4">
        <main className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-2xl p-4 inline-block mb-4">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Something Went Wrong</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            href="/faqs"
            className="bg-[#6366F1] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#5558E3] transition duration-300 inline-block"
            aria-label="Try again to load FAQs"
          >
            Try Again
          </Link>
        </main>
      </div>
    );
  }

  const faqs = filterFAQs(allFAQs, search);

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-6 sm:pb-10 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99, 102, 241) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
        
        {/* Gradient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-[#6366F1] to-transparent rounded-full blur-[100px] opacity-20"></div>
        
        <div className="relative max-w-6xl mx-auto px-6 text-center z-10">
          <div className="inline-block mb-5 px-4 py-1.5 bg-[#6366F1] bg-opacity-10 backdrop-blur-sm border border-[#6366F1] border-opacity-30 rounded-full">
            <span className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-2 justify-center">
              <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
              Help & Support
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-5 leading-[1.1] tracking-tight">
            Frequently Asked Questions
          </h1>
          
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Find answers to common questions about competitive exams, study resources, exam patterns, and preparation strategies. Everything you need to know in one place.
          </p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <SearchForm search={search} />
          </div>
        </div>
      </section>

   
      {/* Featured Section */}
      {featuredFAQs.length > 0 && !search && (
        <section className="relative py-12 bg-gradient-to-b from-[#0A0E27] to-[#1a1f3a]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-8">
              <div className="text-xs font-bold text-[#6366F1] mb-2 tracking-widest uppercase">Featured</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                Featured FAQs
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredFAQs.map((faq, index) => (
                <Link
                  key={faq._id}
                  href={`/faqs/${faq.slug}`}
                  className="group relative bg-[#161B33] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col border border-gray-700 hover:border-[#6366F1] shadow-lg shadow-[#6366F1]/20 hover:shadow-2xl hover:shadow-[#6366F1]/50 min-h-[200px]"
                  aria-label={`View ${faq.topic_title} FAQ`}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/10 via-transparent to-[#EC4899]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative p-6 flex flex-col flex-grow">
                    {/* Index Number */}
                    <div className="absolute top-4 right-4 text-5xl font-black text-white opacity-40 group-hover:opacity-50 transition-opacity">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    
                    {/* Icon & Badge */}
                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#6366F1] text-white">
                        <Star className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true" />
                        <span>Featured</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-snug relative z-10 pr-8">
                      {faq.topic_title}
                    </h3>

                    {/* Description */}
                    {faq.description && (
                      <p className="text-sm text-gray-400 mb-auto line-clamp-2 leading-relaxed relative z-10">{faq.description}</p>
                    )}

                    {/* Footer */}
                    <div className="mt-5 pt-4 border-t border-gray-800 relative z-10">
                      {/* Tags */}
                      {faq.tags && faq.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {faq.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-xs px-2.5 py-1 rounded-md font-medium bg-[#0A0E27] text-white border border-gray-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {/* CTA */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#6366F1] group-hover:text-[#8B5CF6] transition-colors">
                          View Answers
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

      {/* All FAQs */}
      <section id="results-section" className="relative py-12 bg-gradient-to-b from-[#0A0E27] to-[#1a1f3a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-bold text-[#6366F1] mb-2 tracking-widest uppercase">Available Now</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                {faqs.length} {faqs.length === 1 ? 'FAQ' : 'FAQs'} Ready
              </h2>
            </div>
          </div>
          
          {faqs.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-2xl bg-[#161B33]">
              <div className="w-16 h-16 rounded-xl bg-[#0A0E27] border border-gray-800 mx-auto mb-4 flex items-center justify-center">
                <HelpCircle className="w-8 h-8 text-gray-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">No Results Found</h3>
              <p className="text-sm text-gray-400 mb-6">Try adjusting your search or filters</p>
              <Link
                href="/faqs"
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:bg-[#5558E3] bg-[#6366F1] inline-block"
                aria-label="Clear filters and show all FAQs"
              >
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {faqs.map((faq, index) => (
                <Link
                  key={faq._id}
                  href={`/faqs/${faq.slug}`}
                  className="group relative bg-[#161B33] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col border border-gray-700 hover:border-[#6366F1] shadow-lg shadow-[#6366F1]/20 hover:shadow-2xl hover:shadow-[#6366F1]/50 min-h-[200px]"
                  aria-label={`View ${faq.topic_title} FAQ`}
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
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110 bg-[#6366F1] relative z-10"
                    >
                      <HelpCircle className="w-5 h-5 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-snug relative z-10 pr-8">
                      {faq.topic_title}
                    </h3>
                    
                    {/* Featured Badge */}
                    {faq.featured && (
                      <div className="flex flex-wrap gap-2 mb-3 relative z-10">
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 bg-[#6366F1] text-white">
                          <Star className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true" />
                          Featured
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    {faq.description && (
                      <p className="text-sm text-gray-400 mb-auto line-clamp-2 leading-relaxed relative z-10">{faq.description}</p>
                    )}

                    {/* Footer */}
                    <div className="mt-5 pt-4 border-t border-gray-800 relative z-10">
                      {/* Tags */}
                      {faq.tags && faq.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {faq.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 rounded font-medium bg-[#0A0E27] text-white border border-gray-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

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
          <section className="relative py-12 bg-gradient-to-b from-[#0A0E27] to-[#1a1f3a]">
            <div className="max-w-4xl mx-auto px-6">
              <div className="prose prose-lg max-w-none text-white/80 space-y-4 leading-relaxed prose-invert">
                <p className="text-sm sm:text-base">
                  This page provides answers to the most common questions about competitive exams, study materials, and test preparation. Each FAQ section covers a specific topic with clear, concise answers.
                </p>
                <p className="text-sm sm:text-base">
                 <strong className="text-white">What you'll find:</strong> Questions about exam patterns, syllabus coverage, preparation strategies, time management, study resources, and general guidance for various competitive examinations.
                </p>
                <p className="text-sm sm:text-base">
                 <strong className="text-white">How to use it:</strong> Browse through the topics or use the search to find specific questions. Click on any FAQ topic to see all the questions and answers related to that subject. If you don't find what you're looking for, feel free to suggest new topics.
                </p>
              </div>
            </div>
          </section>
 
    </div>
  );
}

