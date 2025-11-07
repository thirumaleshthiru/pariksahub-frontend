import type { Metadata } from 'next';
import JsonLdSchema from '../../../components/JsonLdSchema';
import axiosInstance from '../../../utils/axiosInstance';

type Props = {
  params: Promise<{ slug: string }>;
};

interface ExamPattern {
  exam_name: string;
  description?: string;
  exam_level: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let examPattern: ExamPattern | null = null;

  try {
    const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/api/exam-patterns/slug/${slug}`);
    examPattern = response.data;
  } catch (error) {
    console.error('Error fetching exam pattern for metadata:', error);
  }

  const pageTitle = examPattern ? `${examPattern.exam_name} - Exam Pattern & Syllabus` : 'Exam Pattern & Syllabus';
  const description = examPattern
    ? examPattern.description || `Complete exam pattern and syllabus guide for ${examPattern.exam_name}. Get detailed information about sections, marking scheme, and preparation strategy.`
    : 'Complete exam pattern and syllabus guide for competitive exams. Get detailed information about sections and marking schemes.';
  const keywords = examPattern
    ? `${examPattern.exam_name.toLowerCase()}, ${examPattern.exam_level.toLowerCase()}, exam pattern, syllabus, preparation, study guide, ${examPattern.exam_name.toLowerCase()} exam${examPattern.tags ? ', ' + examPattern.tags.join(', ') : ''}`
    : 'exam pattern, syllabus, preparation, study guide, competitive exams';
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com'}/exam-patterns/${slug}`;

  return {
    title: pageTitle,
    description: description,
    keywords: keywords.split(', '),
    openGraph: {
      title: pageTitle,
      description: description,
      url: canonicalUrl,
      type: 'article',
      siteName: 'PariksaHub',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: description,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function ExamPatternDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let examPattern: ExamPattern | null = null;

  try {
    const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/api/exam-patterns/slug/${slug}`);
    examPattern = response.data;
  } catch (error) {
    console.error('Error fetching exam pattern for schema:', error);
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com';

  const examPatternSchema = examPattern ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${examPattern.exam_name} - Exam Pattern & Syllabus`,
    description: examPattern.description || `Complete exam pattern and syllabus guide for ${examPattern.exam_name}.`,
    url: `${baseUrl}/exam-patterns/${slug}`,
    datePublished: examPattern.createdAt ? new Date(examPattern.createdAt).toISOString() : undefined,
    dateModified: examPattern.updatedAt ? new Date(examPattern.updatedAt).toISOString() : undefined,
    author: {
      '@type': 'Organization',
      name: 'PariksaHub',
    },
    publisher: {
      '@type': 'Organization',
      name: 'PariksaHub',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/assets/PariksaHub.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/exam-patterns/${slug}`,
    },
    articleSection: examPattern.exam_level,
    keywords: examPattern.tags?.join(', ') || examPattern.exam_level,
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
        {
          '@type': 'ListItem',
          position: 3,
          name: examPattern.exam_name,
          item: `${baseUrl}/exam-patterns/${slug}`,
        },
      ],
    },
  } : null;

  return (
    <>
      {examPatternSchema && <JsonLdSchema schema={examPatternSchema} id={`exam-pattern-${slug}-schema`} />}
      {children}
    </>
  );
}

