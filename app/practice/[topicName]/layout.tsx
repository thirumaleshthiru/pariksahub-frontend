import type { Metadata } from 'next';
import { formatDisplayText } from '../../../utils/textUtils';
import JsonLdSchema from '../../../components/JsonLdSchema';

type Props = {
  params: Promise<{ topicName: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topicName } = await params;
  const formattedTopic = formatDisplayText(topicName);

  return {
    title: `${formattedTopic} Important Topics for Preparation`,
    description: `Explore ${formattedTopic}'s important topics for competitive exam preparation, technical interview preparation, programming interview preparation, etc. Practice MCQs with detailed solutions and explanations.`,
    keywords: [
      `${formattedTopic} topics`,
      `${formattedTopic} practice`,
      `${formattedTopic} mcq`,
      'competitive exam preparation',
      'technical interview preparation',
      'programming interview preparation'
    ],
    openGraph: {
      title: `${formattedTopic} Important Topics for Preparation`,
      description: `Explore ${formattedTopic}'s important topics for competitive exam preparation, technical interview preparation, programming interview preparation, etc. Practice MCQs with detailed solutions and explanations.`,
      url: `/practice/${topicName}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${formattedTopic} Important Topics for Preparation`,
      description: `Explore ${formattedTopic}'s important topics for competitive exam preparation, technical interview preparation, programming interview preparation, etc. Practice MCQs with detailed solutions and explanations.`,
    },
    alternates: {
      canonical: `/practice/${topicName}`,
    },
  };
}

export default async function TopicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ topicName: string }>;
}) {
  const { topicName } = await params;
  const formattedTopic = formatDisplayText(topicName);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com';

  const topicSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${formattedTopic} Subtopics`,
    description: `Explore ${formattedTopic} subtopics for competitive exam preparation. Practice MCQs with detailed solutions and explanations.`,
    url: `${baseUrl}/practice/${topicName}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${baseUrl}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Practice',
          item: `${baseUrl}/practice`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: formattedTopic,
          item: `${baseUrl}/practice/${topicName}`,
        },
      ],
    },
  };

  return (
    <>
      <JsonLdSchema schema={topicSchema} id={`topic-${topicName}-schema`} />
      {children}
    </>
  );
}

