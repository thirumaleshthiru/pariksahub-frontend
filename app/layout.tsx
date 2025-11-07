import type { Metadata } from "next";
import CustomNavbar from "../components/CustomNavbar";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import PageTrackingWrapper from "../components/PageTrackingWrapper";
import JsonLdSchema from "../components/JsonLdSchema";
import GoogleAnalytics from "../components/GoogleAnalytics";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com'),
  title: {
    default: "PariksaHub - Practice for Competitive Exams, Interview",
    template: "%s"
  },
  description: "PariksaHub is a free platform to prepare for competitive exams like RRB, SSC, and other general competitive exams. We provide aptitude questions and answers, reasoning, programming, and mathematics MCQs for JEE and more.",
  keywords: [
    "competitive exam practice",
    "aptitude questions",
    "reasoning",
    "quantitative ability",
    "SSC",
    "RRB",
    "banking exams",
    "JEE preparation",
    "free practice tests",
    "MCQs",
    "competitive exam preparation",
    "aptitude test",
    "mock test",
    "exam patterns",
    "cheatsheets"
  ],
  authors: [{ name: "PariksaHub" }],
  creator: "PariksaHub",
  publisher: "PariksaHub",
  category: "Education",
  classification: "Educational Platform",
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  themeColor: '#192A41',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "PariksaHub",
    title: "PariksaHub - Practice for Competitive Exams, Interview",
    description: "PariksaHub is a free platform to prepare for competitive exams like RRB, SSC, and other general competitive exams. We provide aptitude questions and answers, reasoning, programming, and mathematics MCQs for JEE and more.",
    images: [
      {
        url: "/assets/PariksaHub.png",
        width: 1200,
        height: 630,
        alt: "PariksaHub - Competitive Exam Preparation Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PariksaHub - Practice for Competitive Exams, Interview",
    description: "PariksaHub is a free platform to prepare for competitive exams like RRB, SSC, and other general competitive exams. We provide aptitude questions and answers, reasoning, programming, and mathematics MCQs for JEE and more.",
    images: ["/assets/PariksaHub.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add Google Search Console verification if needed
    // google: 'your-google-verification-code',
  },
  alternates: {
    canonical: "/",
  },
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'PariksaHub',
  description: 'PariksaHub is a free platform to prepare for competitive exams like RRB, SSC, and other general competitive exams. We provide aptitude questions and answers, reasoning, programming, and mathematics MCQs for JEE and more.',
  url: baseUrl,
  logo: `${baseUrl}/assets/PariksaHub.png`,
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'pariksahub.feedback@gmail.com',
    contactType: 'Customer Service',
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'PariksaHub',
  description: 'PariksaHub is a free platform to prepare for competitive exams like RRB, SSC, and other general competitive exams.',
  url: baseUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${baseUrl}/practice?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Google Analytics - injected at top of head via useEffect */}
        <GoogleAnalytics />
        
        {/* JSON-LD Schema - injected into head via useEffect (after analytics) */}
        <JsonLdSchema schema={organizationSchema} id="organization-schema" />
        <JsonLdSchema schema={websiteSchema} id="website-schema" />
        
        <div className="flex flex-col min-h-screen">
          <CustomNavbar />
          <ScrollToTop />
          <PageTrackingWrapper />
          <div className="mt-10 flex-1">
            {children}
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
