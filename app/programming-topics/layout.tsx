import type { Metadata } from 'next';
import JsonLdSchema from '../../components/JsonLdSchema';

export const metadata: Metadata = {
  title: 'Programming Topics & Code Questions - Python, Java, DSA, Interview Prep',
  description: 'Explore programming topics with code examples, solutions, and explanations. Practice Python programs, DSA problems, interview questions, and coding challenges with multiple solutions.',
  keywords: [
    'programming topics',
    'code questions',
    'Python programs',
    'Java code',
    'DSA problems',
    'coding interview',
    'programming solutions',
    'code examples',
    'coding practice',
    'algorithm problems'
  ],
  openGraph: {
    title: 'Programming Topics & Code Questions - Python, Java, DSA, Interview Prep',
    description: 'Explore programming topics with code examples, solutions, and explanations. Practice Python programs, DSA problems, and interview questions.',
    url: '/programming-topics',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Programming Topics & Code Questions - Python, Java, DSA, Interview Prep',
    description: 'Explore programming topics with code examples, solutions, and explanations. Practice Python programs, DSA problems, and interview questions.',
  },
  alternates: {
    canonical: '/programming-topics',
  },
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com';

const programmingTopicsSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Programming Topics & Code Questions',
  description: 'Explore programming topics with code examples, solutions, and explanations. Practice Python programs, DSA problems, interview questions, and coding challenges.',
  url: `${baseUrl}/programming-topics`,
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
        name: 'Programming Topics',
        item: `${baseUrl}/programming-topics`,
      },
    ],
  },
};

export default function ProgrammingTopicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLdSchema schema={programmingTopicsSchema} id="programming-topics-schema" />
      {children}
    </>
  );
}

