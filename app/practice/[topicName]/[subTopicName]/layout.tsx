import type { Metadata } from 'next';
import { formatDisplayText } from '../../../../utils/textUtils';
import JsonLdSchema from '../../../../components/JsonLdSchema';

type Props = {
  params: Promise<{ topicName: string; subTopicName: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topicName, subTopicName } = await params;
  const displayTopicName = formatDisplayText(topicName);
  const displaySubTopicName = formatDisplayText(subTopicName);

  return {
    title: `${displaySubTopicName} - ${displayTopicName} Practice Questions and Answers`,
    description: `Practice ${displaySubTopicName} questions from ${displayTopicName}. Free MCQs with detailed explanations and step-by-step solutions for competitive exam preparation, technical interview preparation, programming interview preparation, etc.`,
    keywords: [
      `${displaySubTopicName} questions`,
      `${displayTopicName} mcq`,
      `${displaySubTopicName} practice test`,
      'competitive exam questions',
      'free mcq practice',
      `${displayTopicName} preparation`
    ],
    openGraph: {
      title: `${displaySubTopicName} - ${displayTopicName} Practice Questions and Answers`,
      description: `Practice ${displaySubTopicName} questions from ${displayTopicName}. Free MCQs with detailed explanations and step-by-step solutions for competitive exam preparation.`,
      url: `/practice/${topicName}/${subTopicName}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${displaySubTopicName} - ${displayTopicName} Practice Questions and Answers`,
      description: `Practice ${displaySubTopicName} questions from ${displayTopicName}. Free MCQs with detailed explanations and step-by-step solutions for competitive exam preparation.`,
    },
    alternates: {
      canonical: `/practice/${topicName}/${subTopicName}`,
    },
  };
}

export default async function SubTopicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ topicName: string; subTopicName: string }>;
}) {
  const { topicName, subTopicName } = await params;
  const displayTopicName = formatDisplayText(topicName);
  const displaySubTopicName = formatDisplayText(subTopicName);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com';

  const subTopicSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${displaySubTopicName} Questions - ${displayTopicName}`,
    description: `Practice ${displaySubTopicName} questions from ${displayTopicName}. Free MCQs with detailed explanations and step-by-step solutions for competitive exam preparation.`,
    url: `${baseUrl}/practice/${topicName}/${subTopicName}`,
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
          item: `${baseUrl}/practice/${topicName}/${subTopicName}`,
        },
      ],
    },
  };

  return (
    <>
      <JsonLdSchema schema={subTopicSchema} id={`subtopic-${subTopicName}-schema`} />
      {children}
    </>
  );
}

