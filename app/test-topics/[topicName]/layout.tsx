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
    title: `${formattedTopic} Mock Tests & Practice Questions`,
    description: `Take ${formattedTopic} mock tests and practice questions. Free online tests for competitive exams and technical interviews with detailed solutions.`,
    keywords: [
      `${formattedTopic} mock test`,
      `${formattedTopic} online test`,
      `${formattedTopic} practice questions`,
      'competitive exam test',
      'mock test',
      'online test'
    ],
    openGraph: {
      title: `${formattedTopic} Mock Tests & Practice Questions`,
      description: `Take ${formattedTopic} mock tests and practice questions. Free online tests for competitive exams and technical interviews with detailed solutions.`,
      url: `/test-topics/${topicName}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${formattedTopic} Mock Tests & Practice Questions`,
      description: `Take ${formattedTopic} mock tests and practice questions. Free online tests for competitive exams and technical interviews with detailed solutions.`,
    },
    alternates: {
      canonical: `/test-topics/${topicName}`,
    },
  };
}

export default async function TestSubTopicsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ topicName: string }>;
}) {
  const { topicName } = await params;
  const formattedTopic = formatDisplayText(topicName);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com';

  const testSubTopicsSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${formattedTopic} Mock Tests & Practice Questions`,
    description: `Take ${formattedTopic} mock tests and practice questions. Free online tests for competitive exams and technical interviews with detailed solutions.`,
    url: `${baseUrl}/test-topics/${topicName}`,
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
          name: 'Mock Tests',
          item: `${baseUrl}/test-topics`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: formattedTopic,
          item: `${baseUrl}/test-topics/${topicName}`,
        },
      ],
    },
  };

  return (
    <>
      <JsonLdSchema schema={testSubTopicsSchema} id={`test-subtopics-${topicName}-schema`} />
      {children}
    </>
  );
}

