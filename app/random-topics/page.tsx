 
import Link from 'next/link';
import { AlertCircle, ArrowUpRight, RefreshCw } from 'lucide-react';
import { fetchFromApi } from '../../utils/serverApi';
import { formatDisplayText } from '../../utils/textUtils';
import CountSelect from './CountSelect';

interface Subtopic {
  _id: string;
  subtopic_name: string;
  topic_id: {
    topic_name: string;
  };
}

interface RandomTopicsPageProps {
  searchParams: Promise<{ count?: string }>;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function getRandomSubtopics(count: number = 5): Promise<Subtopic[]> {
  try {
    const allSubtopics = await fetchFromApi('/api/subtopics/all') as Subtopic[];
    if (!allSubtopics || allSubtopics.length === 0) {
      return [];
    }
    
    // Shuffle array and take requested number or maximum available
    const shuffled = shuffleArray(allSubtopics);
    const actualCount = Math.min(count, allSubtopics.length);
    return shuffled.slice(0, actualCount);
  } catch (error) {
    console.error('Error fetching subtopics:', error);
    throw new Error('Failed to load subtopics. Please try again later.');
  }
}

export default async function RandomTopics({ searchParams }: RandomTopicsPageProps) {
  const { count } = await searchParams;
  const selectedCount = count ? parseInt(count, 10) : 5;
  const validCount = [3, 5, 7, 10].includes(selectedCount) ? selectedCount : 5;
  
  let subtopics: Subtopic[] = [];
  let error: string | null = null;

  try {
    subtopics = await getRandomSubtopics(validCount);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load subtopics. Please try again later.';
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
            href="/random-topics"
            className="bg-[#6366F1] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#5558E3] transition duration-300 inline-block"
            aria-label="Try loading random topics again"
          >
            Try Again
          </Link>
        </main>
      </div>
    );
  }

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
            <span className="text-xs font-bold text-white tracking-wider uppercase">Random Practice</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-5 leading-[1.1] tracking-tight">
            Random <span className="bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899] text-transparent bg-clip-text">Practice Topics</span>
          </h1>
          
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Discover random topics from all subjects and practice diverse questions across multiple areas for comprehensive exam preparation.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Count Filter */}
            <form action="/random-topics" method="get" className="inline-block">
              <CountSelect defaultValue={validCount.toString()} />
            </form>
            
            {/* Refresh Button */}
            <Link
              href={`/random-topics${validCount !== 5 ? `?count=${validCount}` : ''}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white rounded-xl hover:bg-[#5558E3] transition-colors text-sm font-bold max-w-fit"
              aria-label="Refresh random topics"
            >
              <RefreshCw className="w-4 h-4 text-white" aria-hidden="true" />
              Refresh
            </Link>
          </div>
        </div>
      </section>

      {/* Topics Section */}
      <section id="results-section" className="relative py-12 bg-gradient-to-b from-[#0A0E27] to-[#1a1f3a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-bold text-[#6366F1] mb-2 tracking-widest uppercase">Available Now</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                {subtopics.length} {subtopics.length === 1 ? 'Topic' : 'Topics'} Ready
              </h2>
            </div>
          </div>
          
          {subtopics.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-2xl bg-[#161B33]">
              <div className="w-16 h-16 rounded-xl bg-[#0A0E27] border border-gray-800 mx-auto mb-4" aria-hidden="true"></div>
              <h3 className="text-xl font-bold mb-2 text-white">No Topics Available</h3>
              <p className="text-sm text-gray-400">Topics will appear here once they are added to the system.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subtopics.map((subtopic, index) => (
                <Link
                  key={subtopic._id}
                  href={`/practice/${subtopic.topic_id.topic_name}/${subtopic.subtopic_name}`}
                  className="group relative bg-[#161B33] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col border border-gray-700 hover:border-[#6366F1] shadow-lg shadow-[#6366F1]/20 hover:shadow-2xl hover:shadow-[#6366F1]/50 min-h-[200px]"
                  aria-label={`Start practicing ${formatDisplayText(subtopic.subtopic_name)} from ${formatDisplayText(subtopic.topic_id.topic_name)}`}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/10 via-transparent to-[#EC4899]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative p-6 flex flex-col flex-grow">
                    {/* Index Number */}
                    <div className="absolute top-4 right-4 text-5xl font-black text-white opacity-40 group-hover:opacity-50 transition-opacity">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-snug relative z-10 pr-8">
                      {formatDisplayText(subtopic.subtopic_name)}
                    </h3>
                    <p className="text-sm text-gray-400 mb-auto relative z-10">
                      from {formatDisplayText(subtopic.topic_id.topic_name)}
                    </p>

                    {/* Footer */}
                    <div className="mt-5 pt-4 border-t border-gray-800 relative z-10">
                      {/* CTA */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#6366F1] group-hover:text-[#8B5CF6] transition-colors">
                          Start Practice
                        </span>
                        <div className="w-10 h-10 bg-[#6366F1] group-hover:bg-gradient-to-br group-hover:from-[#6366F1] group-hover:to-[#8B5CF6] flex items-center justify-center transition-all duration-300 group-hover:rotate-45 rounded-lg">
                          <ArrowUpRight className="w-5 h-5 text-white transition-all duration-300" aria-hidden="true" />
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
    </div>
  );
}

