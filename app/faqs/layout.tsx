import type { Metadata } from 'next';
import JsonLdSchema from '../../components/JsonLdSchema';

export const metadata: Metadata = {
  title: 'Frequently Asked Interview Questions with Answers',
  description: 'Frequently asked questions in competitive exams, technical interviews, exam patterns, preparation strategies, and more. Get an idea of what to expect before you prepare and prepare accordingly.',
  keywords: [
    'FAQs',
    'frequently asked questions',
    'exam questions',
    'study help',
    'competitive exam FAQs',
    'exam preparation questions',
    'common questions',
    'exam guidance'
  ],
  openGraph: {
    title: 'Frequently Asked Interview Questions with Answers',
    description: 'Frequently asked questions in competitive exams, technical interviews, exam patterns, preparation strategies, and more. Get an idea of what to expect before you prepare and prepare accordingly.',
    url: '/faqs',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frequently Asked Interview Questions with Answers',
    description: 'Frequently asked questions about competitive exams, study resources, exam patterns, and preparation strategies. Get answers to common queries.',
  },
  alternates: {
    canonical: '/faqs',
  },
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com';

const faqsSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Frequently Asked Interview Questions with Answers',
  description: 'Frequently asked questions about competitive exams, study resources, exam patterns, preparation strategies and more. Get answers to common queries.',
  url: `${baseUrl}/faqs`,
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
        name: 'Frequently Asked Interview Questions with Answers',
        item: `${baseUrl}/faqs`,
      },
    ],
  },
};

export default function FAQsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLdSchema schema={faqsSchema} id="faqs-schema" />
      {children}
    </>
  );
}

