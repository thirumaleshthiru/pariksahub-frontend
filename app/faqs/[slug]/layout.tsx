import type { Metadata } from 'next';
import JsonLdSchema from '../../../components/JsonLdSchema';
import axiosInstance from '../../../utils/axiosInstance';

// Enable ISR - revalidate every 60 seconds for better performance
export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const response = await axiosInstance.get(`/api/faqs/slug/${slug}`);
    const faq = response.data;

    if (faq) {
      const pageTitle = `${faq.topic_title}`;
      const description = faq.description || `Find answers to common questions about ${faq.topic_title}. Clear and comprehensive answers to help with your queries.`;
      const keywords = `${faq.topic_title.toLowerCase()}, FAQ, frequently asked questions, ${faq.topic_title.toLowerCase()} questions${faq.tags ? ', ' + faq.tags.join(', ') : ''}`;

      return {
        title: pageTitle,
        description: description,
        keywords: keywords.split(', '),
        openGraph: {
          title: pageTitle,
          description: description,
          url: `/faqs/${slug}`,
          type: 'article',
          siteName: 'PariksaHub',
          publishedTime: faq.createdAt,
          modifiedTime: faq.updatedAt,
        },
        twitter: {
          card: 'summary_large_image',
          title: pageTitle,
          description: description,
        },
        alternates: {
          canonical: `/faqs/${slug}`,
        },
      };
    }
  } catch (error) {
    console.error('Error fetching FAQ for metadata:', error);
  }

  // Fallback metadata
  return {
    title: 'FAQ',
    description: 'Frequently asked questions about competitive exams and study resources.',
    keywords: ['FAQ', 'frequently asked questions', 'exam help'],
    alternates: {
      canonical: `/faqs/${slug}`,
    },
  };
}

export default async function FAQDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com';

  let faqSchema = null;
  try {
    const response = await axiosInstance.get(`/api/faqs/slug/${slug}`);
    const faq = response.data;

    if (faq && faq.questions && faq.questions.length > 0) {
      // Sort questions by order and limit to first 5 for schema
      const sortedQuestions = [...faq.questions].sort((a, b) => (a.order || 0) - (b.order || 0));
      const limitedQuestions = sortedQuestions.slice(0, 5);

      faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        name: faq.topic_title,
        description: faq.description || `Frequently asked questions about ${faq.topic_title}`,
        url: `${baseUrl}/faqs/${slug}`,
        mainEntity: limitedQuestions.map(q => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answer
          }
        })),
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
              name: 'FAQs',
              item: `${baseUrl}/faqs`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: faq.topic_title,
              item: `${baseUrl}/faqs/${slug}`,
            },
          ],
        },
        datePublished: faq.createdAt,
        dateModified: faq.updatedAt,
        author: {
          '@type': 'Organization',
          name: 'PariksaHub',
        },
        publisher: {
          '@type': 'Organization',
          name: 'PariksaHub',
        }
      };
    }
  } catch (error) {
    console.error('Error fetching FAQ for schema:', error);
  }

  return (
    <>
      {faqSchema && (
        <JsonLdSchema schema={faqSchema} id={`faq-${slug}-schema`} />
      )}
      {children}
    </>
  );
}

