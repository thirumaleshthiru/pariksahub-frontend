import type { Metadata } from 'next';
import { formatDisplayText } from '../../../utils/textUtils';
import JsonLdSchema from '../../../components/JsonLdSchema';
import axiosInstance from '../../../utils/axiosInstance';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const response = await axiosInstance.get(`/api/cheatsheets/slug/${slug}`);
    const cheatsheet = response.data;

    if (cheatsheet) {
      const pageTitle = `Latest ${cheatsheet.title}`;
      const description = cheatsheet.description || `Comprehensive ${cheatsheet.title} cheatsheet for quick reference. Find formulas, facts, code examples and reference materials.`;
      const keywords = `${cheatsheet.title.toLowerCase()}, ${cheatsheet.category.toLowerCase()}, cheatsheet, ${cheatsheet.title.toLowerCase()} reference, ${cheatsheet.title.toLowerCase()} formulas${cheatsheet.tags ? ', ' + cheatsheet.tags.join(', ') : ''}`;

      return {
        title: pageTitle,
        description: description,
        keywords: keywords.split(', '),
        openGraph: {
          title: pageTitle,
          description: description,
          url: `/cheatsheets/${slug}`,
          type: 'article',
          siteName: 'PariksaHub',
          section: cheatsheet.category,
          tags: cheatsheet.tags || [],
          publishedTime: cheatsheet.createdAt,
          modifiedTime: cheatsheet.updatedAt,
        },
        twitter: {
          card: 'summary_large_image',
          title: pageTitle,
          description: description,
        },
        alternates: {
          canonical: `/cheatsheets/${slug}`,
        },
      };
    }
  } catch (error) {
    console.error('Error fetching cheatsheet for metadata:', error);
  }

  // Fallback metadata
  return {
    title: 'Cheatsheet',
    description: 'Quick reference cheatsheet for competitive exams and programming. Find formulas, facts, and code examples.',
    keywords: ['cheatsheet', 'quick reference', 'formulas', 'reference guide'],
    alternates: {
      canonical: `/cheatsheets/${slug}`,
    },
  };
}

export default async function CheatsheetDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com';

  let cheatsheetSchema = null;
  try {
    const response = await axiosInstance.get(`/api/cheatsheets/slug/${slug}`);
    const cheatsheet = response.data;

    if (cheatsheet) {
      cheatsheetSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: cheatsheet.title,
        description: cheatsheet.description || `Comprehensive ${cheatsheet.title} cheatsheet for quick reference.`,
        url: `${baseUrl}/cheatsheets/${slug}`,
        datePublished: cheatsheet.createdAt,
        dateModified: cheatsheet.updatedAt,
        author: {
          '@type': 'Organization',
          name: 'PariksaHub',
        },
        publisher: {
          '@type': 'Organization',
          name: 'PariksaHub',
        },
        articleSection: cheatsheet.category,
        keywords: cheatsheet.tags?.join(', ') || cheatsheet.category,
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
            {
              '@type': 'ListItem',
              position: 3,
              name: cheatsheet.title,
              item: `${baseUrl}/cheatsheets/${slug}`,
            },
          ],
        },
      };
    }
  } catch (error) {
    console.error('Error fetching cheatsheet for schema:', error);
  }

  return (
    <>
      {cheatsheetSchema && (
        <JsonLdSchema schema={cheatsheetSchema} id={`cheatsheet-${slug}-schema`} />
      )}
      {children}
    </>
  );
}

