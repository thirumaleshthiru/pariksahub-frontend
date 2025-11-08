import type { Metadata } from 'next';
import { formatDisplayText } from '../../../utils/textUtils';
import JsonLdSchema from '../../../components/JsonLdSchema';
import axiosInstance from '../../../utils/axiosInstance';

type Props = {
  params: Promise<{ subTopicName: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subTopicName } = await params;
  const formattedSubTopic = formatDisplayText(subTopicName);

  try {
    const response = await axiosInstance.get(`/api/questions/subtopic/${subTopicName}`);
    const questions = response.data || [];
    const questionCount = questions.length;

    const pageTitle = questionCount > 0
      ? `${formattedSubTopic} Online Mock Test`
      : `${formattedSubTopic} Online Mock Test | PariksaHub`;

    const description = questionCount > 0
      ? `Take ${formattedSubTopic} mock test with ${questionCount} questions in 30 minutes. Real exam simulation with automatic scoring and instant results for competitive exam preparation.`
      : `Take ${formattedSubTopic} online mock test with 30 minute timer. Practice competitive exam questions with automatic scoring and instant results.`;

    const keywords = questionCount > 0
      ? `${formattedSubTopic} mock test, ${formattedSubTopic} online test, ${questionCount} questions, competitive exam mock test, timed practice test, online assessment`
      : `${formattedSubTopic} mock test, competitive exam mock test, timed practice test, online assessment`;

    return {
      title: pageTitle,
      description: description,
      keywords: keywords.split(', '),
      openGraph: {
        title: pageTitle,
        description: description,
        url: `/onlinetest/${subTopicName}`,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: description,
      },
      alternates: {
        canonical: `/onlinetest/${subTopicName}`,
      },
    };
  } catch (error) {
    console.error('Error fetching questions for metadata:', error);
  }

  // Fallback metadata
  return {
      title: `${formattedSubTopic} Online Mock Test | PariksaHub`,
    description: `Take ${formattedSubTopic} online mock test with 30 minute timer. Practice competitive exam questions with automatic scoring and instant results.`,
    keywords: [`${formattedSubTopic} mock test`, 'competitive exam mock test', 'timed practice test', 'online assessment'],
    alternates: {
      canonical: `/onlinetest/${subTopicName}`,
    },
  };
}

export default async function OnlineTestLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subTopicName: string }>;
}) {
  const { subTopicName } = await params;
  const formattedSubTopic = formatDisplayText(subTopicName);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com';

  let onlineTestSchema = null;
  try {
    const response = await axiosInstance.get(`/api/questions/subtopic/${subTopicName}`);
    const questions = response.data || [];
    const questionCount = questions.length;

    if (questionCount > 0) {
      onlineTestSchema = {
        '@context': 'https://schema.org',
        '@type': 'Assessment',
        name: `${formattedSubTopic} Online Mock Test`,
        description: `Take ${formattedSubTopic} mock test with ${questionCount} questions. Real exam simulation with automatic scoring and instant results.`,
        url: `${baseUrl}/onlinetest/${subTopicName}`,
        timeRequired: 'PT30M',
        numberOfQuestions: questionCount,
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
              name: 'Mock Tests',
              item: `${baseUrl}/test-topics`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: formattedSubTopic,
              item: `${baseUrl}/onlinetest/${subTopicName}`,
            },
          ],
        },
      };
    }
  } catch (error) {
    console.error('Error fetching questions for schema:', error);
  }

  return (
    <>
      {onlineTestSchema && (
        <JsonLdSchema schema={onlineTestSchema} id={`onlinetest-${subTopicName}-schema`} />
      )}
      {children}
    </>
  );
}

