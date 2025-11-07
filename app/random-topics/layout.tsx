import type { Metadata } from 'next';
import JsonLdSchema from '../../components/JsonLdSchema';

export const metadata: Metadata = {
  title: 'Practice Random Questions from General Aptitude, Reasoning, Programming, and more',
  description: 'Practice random topics from all subjects for competitive exam preparation. Get diverse questions across multiple areas with instant practice tests.',
  keywords: [
    'random practice',
    'random topics',
    'competitive exam practice',
    'random questions',
    'practice random',
    'exam preparation'
  ],
  openGraph: {
    title: 'Random Practice - Practice Random Questions',
    description: 'Practice random topics from all subjects for competitive exam preparation. Get diverse questions across multiple areas with instant practice tests.',
    url: '/random-topics',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Random Practice - Practice Random Questions',
    description: 'Practice random topics from all subjects for competitive exam preparation. Get diverse questions across multiple areas with instant practice tests.',
  },
  alternates: {
    canonical: '/random-topics',
  },
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com';

const randomTopicsSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Random Practice - Practice Random Questions',
  description: 'Practice random topics from all subjects for competitive exam preparation. Get diverse questions across multiple areas with instant practice tests.',
  url: `${baseUrl}/random-topics`,
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
        name: 'Random Topics',
        item: `${baseUrl}/random-topics`,
      },
    ],
  },
};

export default function RandomTopicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLdSchema schema={randomTopicsSchema} id="random-topics-schema" />
      {children}
    </>
  );
}

