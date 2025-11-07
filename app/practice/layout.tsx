import type { Metadata } from 'next';
import JsonLdSchema from '../../components/JsonLdSchema';

export const metadata: Metadata = {
  title: 'Practice Questions for Competitive Exams',
  description: 'Practice competitive exam questions with detailed solutions. Free MCQs covering aptitude, reasoning, quantitative ability, and technical topics for SSC, RRB, Banking and other competitive exams.',
  keywords: [
    'competitive exam practice',
    'aptitude questions',
    'reasoning',
    'quantitative ability',
    'technical MCQs',
    'free practice tests',
    'SSC',
    'RRB',
    'banking exams',
    'competitive exam preparation'
  ],
  openGraph: {
    title: 'Practice Questions for Competitive Exams',
    description: 'Practice competitive exam questions with detailed solutions. Free MCQs covering aptitude, reasoning, quantitative ability, and technical topics for SSC, RRB, Banking and other competitive exams.',
    url: '/practice',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Practice Questions for Competitive Exams',
    description: 'Practice competitive exam questions with detailed solutions. Free MCQs covering aptitude, reasoning, quantitative ability, and technical topics for SSC, RRB, Banking and other competitive exams.',
  },
  alternates: {
    canonical: '/practice',
  },
};

const practiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Practice Questions for Competitive Exams',
  description: 'Practice competitive exam questions with detailed solutions. Free MCQs covering aptitude, reasoning, quantitative ability, and technical topics for SSC, RRB, Banking and other competitive exams.',
  url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com'}/practice`,
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: {
      '@type': 'ListItem',
      position: 1,
      name: 'Practice Questions',
    },
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com'}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Practice',
        item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com'}/practice`,
      },
    ],
  },
};

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLdSchema schema={practiceSchema} id="practice-schema" />
      {children}
    </>
  );
}

