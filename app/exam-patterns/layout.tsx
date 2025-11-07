import type { Metadata } from 'next';
import JsonLdSchema from '../../components/JsonLdSchema';

export const metadata: Metadata = {
  title: 'Exam Patterns & Syllabus Guide - PariksaHub',
  description: 'Complete exam patterns and syllabus guides for SSC, RRB, Banking, UPSC and other competitive exams. Get detailed marking schemes, section-wise patterns, and preparation strategies.',
  keywords: [
    'exam pattern',
    'syllabus guide',
    'competitive exams',
    'SSC exam pattern',
    'RRB syllabus',
    'banking exam pattern',
    'UPSC pattern',
    'marking scheme',
    'section-wise pattern'
  ],
  openGraph: {
    title: 'Exam Patterns & Syllabus Guide - PariksaHub',
    description: 'Complete exam patterns and syllabus guides for SSC, RRB, Banking, UPSC and other competitive exams. Get detailed marking schemes, section-wise patterns, and preparation strategies.',
    url: '/exam-patterns',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Exam Patterns & Syllabus Guide - PariksaHub',
    description: 'Complete exam patterns and syllabus guides for SSC, RRB, Banking, UPSC and other competitive exams. Get detailed marking schemes, section-wise patterns, and preparation strategies.',
  },
  alternates: {
    canonical: '/exam-patterns',
  },
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com';

const examPatternsSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Exam Patterns & Syllabus Guide - PariksaHub',
  description: 'Complete exam patterns and syllabus guides for SSC, RRB, Banking, UPSC and other competitive exams. Get detailed marking schemes, section-wise patterns, and preparation strategies.',
  url: `${baseUrl}/exam-patterns`,
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
        name: 'Exam Patterns',
        item: `${baseUrl}/exam-patterns`,
      },
    ],
  },
};

export default function ExamPatternsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLdSchema schema={examPatternsSchema} id="exam-patterns-schema" />
      {children}
    </>
  );
}

