import type { Metadata, Viewport } from "next";
import Script from "next/script";
import CustomNavbar from "../components/CustomNavbar";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import PageTrackingWrapper from "../components/PageTrackingWrapper";
import JsonLdSchema from "../components/JsonLdSchema";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com'),
  title: {
    default: "PariksaHub | Free Competitive Exam Practice Tests & Mock Quizzes",
    template: "%s"
  },
  description: "PariksaHub offers free competitive exam practice tests, mock quizzes, and topic-wise drills for SSC, RRB, banking, campus placements, and more.",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "PariksaHub",
    title: "PariksaHub | Free Competitive Exam Practice Tests & Mock Quizzes",
    description: "PariksaHub offers free competitive exam practice tests, mock quizzes, and topic-wise drills for SSC, RRB, banking, campus placements, and more.",
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
    title: "PariksaHub | Free Competitive Exam Practice Tests & Mock Quizzes",
    description: "PariksaHub offers free competitive exam practice tests, mock quizzes, and topic-wise drills for SSC, RRB, banking, campus placements, and more.",
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#192A41',
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'PariksaHub',
  description: 'PariksaHub offers free competitive exam practice tests, mock quizzes, and topic-wise drills for SSC, RRB, banking, campus placements, and more.',
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
  description: 'PariksaHub offers free competitive exam practice tests, mock quizzes, and topic-wise drills for SSC, RRB, banking, campus placements, and more.',
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
      <head>
        {/* Resource hints for faster loading */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || ''} />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body>
        {/* Google Analytics - using Next.js Script component for proper ordering */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-E717Z3TMN6"
          strategy="lazyOnload"
        />
        <Script id="google-analytics-config" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-E717Z3TMN6', {
              send_page_view: false,
              page_path: window.location.pathname,
            });
          `}
        </Script>

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
