import type { Metadata } from 'next';
import JsonLdSchema from '../../components/JsonLdSchema';

export const metadata: Metadata = {
  title: 'Online Mock Tests - Competitive Exams & Technical Interviews',
  description: 'Take online mock tests for competitive exams and technical interviews. Practice with timed assessments, instant scoring and detailed performance analysis.',
  keywords: [
    'online mock tests',
    'competitive exam mock tests',
    'technical interview tests',
    'timed assessments',
    'practice tests',
    'mock test series'
  ],
  openGraph: {
    title: 'Online Mock Tests - Competitive Exams & Technical Interviews',
    description: 'Take online mock tests for competitive exams and technical interviews. Practice with timed assessments, instant scoring and detailed performance analysis.',
    url: '/test-topics',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Mock Tests - Competitive Exams & Technical Interviews',
    description: 'Take online mock tests for competitive exams and technical interviews. Practice with timed assessments, instant scoring and detailed performance analysis.',
  },
  alternates: {
    canonical: '/test-topics',
  },
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com';

const testTopicsSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Online Mock Tests - Competitive Exams & Technical Interviews',
  description: 'Take online mock tests for competitive exams and technical interviews. Practice with timed assessments, instant scoring and detailed performance analysis.',
  url: `${baseUrl}/test-topics`,
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
    ],
  },
};

export default function TestTopicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLdSchema schema={testTopicsSchema} id="test-topics-schema" />
      {children}
    </>
  );
}

