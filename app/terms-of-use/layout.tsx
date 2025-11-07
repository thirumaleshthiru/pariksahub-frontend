import type { Metadata } from 'next';
import JsonLdSchema from '../../components/JsonLdSchema';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for PariksaHub. Read our terms and conditions before using our services. Learn about user responsibilities and service guidelines.',
  keywords: [
    'terms of use',
    'terms and conditions',
    'user agreement',
    'service terms',
    'PariksaHub terms'
  ],
  openGraph: {
    title: 'Terms of Use',
    description: 'Terms of use for PariksaHub. Read our terms and conditions before using our services. Learn about user responsibilities and service guidelines.',
    url: '/terms-of-use',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Use',
    description: 'Terms of use for PariksaHub. Read our terms and conditions before using our services. Learn about user responsibilities and service guidelines.',
  },
  alternates: {
    canonical: '/terms-of-use',
  },
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com';

const termsOfUseSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Terms of Use',
  description: 'Terms of use for PariksaHub. Read our terms and conditions before using our services. Learn about user responsibilities and service guidelines.',
  url: `${baseUrl}/terms-of-use`,
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
        name: 'Terms of Use',
        item: `${baseUrl}/terms-of-use`,
      },
    ],
  },
};

export default function TermsOfUseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLdSchema schema={termsOfUseSchema} id="terms-of-use-schema" />
      {children}
    </>
  );
}

