import React from 'react';
import Link from 'next/link';

function PrivacyPolicy() {
  const lastUpdated = new Date().toLocaleDateString('en-IN');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#192A41] text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-gray-400 mt-4">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div>
          
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">
              Introduction
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                PariksaHub ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using our services, you agree to the collection and use of information in accordance with this policy.
              </p>
            </div>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">
              Information We Collect
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#192A41] mb-3">Information We Collect</h3>
                <p className="text-gray-700 mb-4">
                  We collect minimal data to provide our educational services:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Admin Users Only:</strong> Username and password for content management (admin access only)</li>
                  <li><strong>Local Storage:</strong> Saved question IDs and personal notes (stored only on your device)</li>
                  <li><strong>AI Usage:</strong> When you use our AI explanation feature, your question content is sent to Google Gemini AI for processing</li>
                  <li><strong>Website Analytics:</strong> Anonymous usage data to improve our platform</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[#192A41] mb-3">Local Data Storage</h3>
                <p className="text-gray-700 mb-4">
                  The following data is stored locally on your device and is not sent to our servers:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Saved question IDs (for bookmarking questions)</li>
                  <li>Personal notes (using the floating notes feature)</li>
                  <li>Your selected answers during practice sessions</li>
                  <li>AI explanation requests (temporarily processed by Google Gemini AI)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#192A41] mb-3">Automatic Data Collection</h3>
                <p className="text-gray-700">
                  We may collect basic technical information such as IP addresses and browser information for security and analytics purposes, but this data is not linked to your personal identity.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">
              How We Use Your Information
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 mb-4">
                Our data usage is focused on providing our educational services:
              </p>
              
              <div>
                <h3 className="text-lg font-semibold text-[#192A41] mb-3">Service Delivery</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Provide practice questions for competitive exams (SSC, RRB, Banking)</li>
                  <li>Enable topic-wise practice across subjects (Aptitude, Reasoning, Quantitative)</li>
                  <li>Deliver online mock tests with 30-minute timer</li>
                  <li>Enable local storage of saved questions and floating notes</li>
                  <li>Provide AI explanations using Google Gemini AI</li>
                  <li>Support admin content management system</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-[#192A41] mb-3">Analytics & Improvement</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Analyze anonymous usage patterns to improve our services</li>
                  <li>Monitor website performance and security</li>
                  <li>Develop new educational features and question types</li>
                  <li>Ensure platform stability and reliability</li>
                  <li>Optimize AI explanation accuracy and relevance</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">
              Data Security
            </h2>
            <div>
              <p className="text-gray-700 mb-4">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication</li>
                <li>Secure data storage and backup procedures</li>
                <li>Employee training on data protection</li>
              </ul>
            </div>
          </section>

          {/* Information Sharing */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">
              Information Sharing
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                We may share anonymous, aggregated data in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Service providers:</strong> Trusted third parties who help us operate our platform (hosting, analytics)</li>
                <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Aggregated data:</strong> Anonymous, aggregated statistics that cannot identify individual users</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">Your Rights</h2>
            <div className="space-y-4">
              <p className="text-gray-700 mb-4">
                Your rights are related to local data and website usage:
              </p>
              
              <div>
                <h3 className="text-lg font-semibold text-[#192A41] mb-3">Local Data Control</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Clear your saved questions and notes from your device</li>
                  <li>Disable local storage in your browser settings</li>
                  <li>Delete browser data to remove all locally stored information</li>
                  <li>Use the platform without saving any data locally</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-[#192A41] mb-3">Website Usage</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Use our services without creating an account</li>
                  <li>Access all educational content without registration</li>
                  <li>Control cookie preferences through your browser</li>
                  <li>Contact us with any privacy concerns</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">Cookies and Tracking</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                We use cookies and similar technologies to enhance your experience on our platform:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for basic site functionality</li>
                <li><strong>Performance Cookies:</strong> Help us understand site usage</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences</li>
              </ul>
            </div>
          </section>

          {/* AI Usage */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">AI-Powered Features</h2>
            <div>
              <p className="text-gray-700 mb-4">
                Our platform uses Google Gemini AI to provide AI-powered explanations for questions. When you use this feature:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Your question content is sent to Google Gemini AI for processing</li>
                <li>No personal information is included in these requests</li>
                <li>AI responses are generated based on the question content only</li>
                <li>We do not store your AI explanation requests on our servers</li>
                <li>Google's privacy policy applies to data processed by their AI service</li>
                <li><strong>We are NOT responsible for any misinformation</strong> provided by AI</li>
              </ul>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">Children's Privacy</h2>
            <div>
              <p className="text-gray-700">
                Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </div>
          </section>

          {/* Changes to Privacy Policy */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">Contact Us</h2>
            <div>
              <p className="text-lg mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> pariksahub.feedback@gmail.com</p>
                <p><strong>Website:</strong> <Link href="/" className="text-blue-600 hover:underline">pariksahub.com</Link></p>
                <p><strong>Response Time:</strong> We typically respond within 48 hours</p>
              </div>
            </div>
          </section>

          {/* Footer Links */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-800 mb-4 sm:mb-0"
              >
                Back to Home
              </Link>
              <div className="flex space-x-6">
                <Link 
                  href="/terms-of-use" 
                  className="text-gray-600 hover:text-gray-800"
                >
                  Terms of Use
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
