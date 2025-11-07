import type { Metadata } from 'next';
import { formatDisplayText } from '../../../../../utils/textUtils';
import JsonLdSchema from '../../../../../components/JsonLdSchema';

type Props = {
  params: Promise<{ topicName: string; subTopicName: string; examTypeName: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topicName, examTypeName, subTopicName: subtopicName } = await params;
  const displayExamName = formatDisplayText(examTypeName);
  const displaySubTopicName = formatDisplayText(subtopicName);
  const displayTopicName = formatDisplayText(topicName);

  return {
    title: `${displayExamName.toUpperCase()} ${displaySubTopicName} Questions - ${displayTopicName}`,
    description: `Practice ${displayExamName.toUpperCase()} ${displaySubTopicName} questions from ${displayTopicName}. Free MCQs with detailed solutions and previous year questions for competitive exam preparation.`,
    keywords: [
      `${displayExamName} questions`,
      `${displaySubTopicName} mcq`,
      `${displayTopicName} practice`,
      'competitive exam questions',
      `${displayExamName} previous year questions`,
      'free mcq practice'
    ],
    openGraph: {
      title: `${displayExamName.toUpperCase()} ${displaySubTopicName} Questions - ${displayTopicName}`,
      description: `Practice ${displayExamName.toUpperCase()} ${displaySubTopicName} questions from ${displayTopicName}. Free MCQs with detailed solutions and previous year questions for competitive exam preparation.`,
      url: `/practice/${topicName}/${subtopicName}/${examTypeName}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${displayExamName.toUpperCase()} ${displaySubTopicName} Questions - ${displayTopicName}`,
      description: `Practice ${displayExamName.toUpperCase()} ${displaySubTopicName} questions from ${displayTopicName}. Free MCQs with detailed solutions and previous year questions for competitive exam preparation.`,
    },
    alternates: {
      canonical: `/practice/${topicName}/${subtopicName}/${examTypeName}`,
    },
  };
}

export default async function ExamTypeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ topicName: string; subTopicName: string; examTypeName: string }>;
}) {
  const { topicName, examTypeName, subTopicName: subtopicName } = await params;
  const displayExamName = formatDisplayText(examTypeName);
  const displaySubTopicName = formatDisplayText(subtopicName);
  const displayTopicName = formatDisplayText(topicName);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com';

  const examTypeSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${displayExamName.toUpperCase()} ${displaySubTopicName} Questions - ${displayTopicName}`,
    description: `Practice ${displayExamName.toUpperCase()} ${displaySubTopicName} questions from ${displayTopicName}. Free MCQs with detailed solutions and previous year questions for competitive exam preparation.`,
    url: `${baseUrl}/practice/${topicName}/${subtopicName}/${examTypeName}`,
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
          name: 'Practice',
          item: `${baseUrl}/practice`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: displayTopicName,
          item: `${baseUrl}/practice/${topicName}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: displaySubTopicName,
          item: `${baseUrl}/practice/${topicName}/${subtopicName}`,
        },
        {
          '@type': 'ListItem',
          position: 5,
          name: `${displayExamName.toUpperCase()} Questions`,
          item: `${baseUrl}/practice/${topicName}/${subtopicName}/${examTypeName}`,
        },
      ],
    },
  };

  return (
    <>
      <JsonLdSchema schema={examTypeSchema} id={`exam-${examTypeName}-schema`} />
      {children}
    </>
  );
}

