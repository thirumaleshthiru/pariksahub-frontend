import type { Metadata } from 'next';
import JsonLdSchema from '../../components/JsonLdSchema';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for PariksaHub. Learn how we collect, use, and protect your information. Your privacy is important to us.',
  keywords: [
    'privacy policy',
    'data protection',
    'user privacy',
    'information security',
    'PariksaHub privacy'
  ],
  openGraph: {
    title: 'Privacy Policy',
    description: 'Privacy policy for PariksaHub. Learn how we collect, use, and protect your information. Your privacy is important to us.',
    url: '/privacy-policy',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy',
    description: 'Privacy policy for PariksaHub. Learn how we collect, use, and protect your information. Your privacy is important to us.',
  },
  alternates: {
    canonical: '/privacy-policy',
  },
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com';

const privacyPolicySchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Privacy Policy',
  description: 'Privacy policy for PariksaHub. Learn how we collect, use, and protect your information. Your privacy is important to us.',
  url: `${baseUrl}/privacy-policy`,
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
        name: 'Privacy Policy',
        item: `${baseUrl}/privacy-policy`,
      },
    ],
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLdSchema schema={privacyPolicySchema} id="privacy-policy-schema" />
      {children}
    </>
  );
}

