import type { Metadata } from 'next';
import { fetchFromApi } from '../../../utils/serverApi';

// Enable ISR - revalidate every 60 seconds for better performance
export const revalidate = 60;

interface TopicLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

async function getTopicMetadata(slug: string) {
  try {
    const data = await fetchFromApi(`/api/programming-topics/metadata/${encodeURIComponent(slug)}`) as {
      topic: {
        title: string;
        description?: string;
        category: string;
        tags?: string[];
      };
      question_count: number;
    };
    return data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: TopicLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTopicMetadata(slug);

  if (!data || !data.topic) {
    return {
      title: 'Programming Topic Not Found',
      description: 'The programming topic you are looking for does not exist.',
    };
  }

  const { topic, question_count } = data;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com';
  const url = `${baseUrl}/programming-topics/${slug}`;
  const description = topic.description || `Explore ${topic.title} with ${question_count} code questions, solutions, and explanations. Practice programming with real examples.`;

  return {
    title: `${topic.title}`,
    description: description,
    keywords: [
      topic.title,
      'programming questions',
      'code examples',
      topic.category,
      'coding practice',
      'programming solutions',
      ...(topic.tags || [])
    ],
    openGraph: {
      title: `${topic.title}`,
      description: description,
      url: url,
      type: 'article',
      siteName: 'PariksaHub',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${topic.title} - Programming Questions & Code Examples`,
      description: description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function TopicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

