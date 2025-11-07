import type { Metadata } from 'next';
import JsonLdSchema from '../../components/JsonLdSchema';

export const metadata: Metadata = {
  title: 'Cheatsheets & Quick Reference Guides',
  description: 'Quick reference cheatsheets and study guides for competitive exams, programming, formulas and more. Find essential facts, formulas, code snippets and reference materials in one place.',
  keywords: [
    'cheatsheets',
    'quick reference',
    'study guides',
    'formulas',
    'competitive exam cheatsheets',
    'programming reference',
    'code snippets',
    'reference guides'
  ],
  openGraph: {
    title: 'Cheatsheets & Quick Reference Guides',
    description: 'Quick reference cheatsheets and study guides for competitive exams, programming, formulas and more. Find essential facts, formulas, code snippets and reference materials in one place.',
    url: '/cheatsheets',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cheatsheets & Quick Reference Guides',
    description: 'Quick reference cheatsheets and study guides for competitive exams, programming, formulas and more. Find essential facts, formulas, code snippets and reference materials in one place.',
  },
  alternates: {
    canonical: '/cheatsheets',
  },
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com';

const cheatsheetsSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Cheatsheets & Quick Reference Guides',
  description: 'Quick reference cheatsheets and study guides for competitive exams, programming, formulas and more. Find essential facts, formulas, code snippets and reference materials in one place.',
  url: `${baseUrl}/cheatsheets`,
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
        name: 'Cheatsheets',
        item: `${baseUrl}/cheatsheets`,
      },
    ],
  },
};

export default function CheatsheetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLdSchema schema={cheatsheetsSchema} id="cheatsheets-schema" />
      {children}
    </>
  );
}

