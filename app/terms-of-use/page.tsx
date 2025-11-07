import React from 'react';
import Link from 'next/link';

function TermsOfUse() {
  const lastUpdated = new Date().toLocaleDateString('en-IN');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#192A41] text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Use</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Please read these terms carefully before using our services. By using PariksaHub, you agree to these terms.
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
              Agreement to Terms
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to PariksaHub! These Terms of Use ("Terms") govern your use of our website and services. By accessing or using PariksaHub, you agree to be bound by these Terms.
              </p>
              <p className="text-gray-700 leading-relaxed">
                If you do not agree to these Terms, please do not use our services.
              </p>
            </div>
          </section>

          {/* Service Description */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">
              Our Services
            </h2>
            <div>
              <p className="text-gray-700 mb-4">
                PariksaHub provides educational content and practice materials for competitive exam preparation, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Practice questions for competitive exams (SSC, RRB, Banking)</li>
                <li>Topic-wise practice across subjects (Aptitude, Reasoning, Quantitative)</li>
                <li>Online mock tests with 30-minute timer</li>
                <li>Save questions locally for later review</li>
                <li>Floating notes feature for personal study notes</li>
                <li>AI explanations using Google Gemini AI</li>
                <li>Admin panel for content management</li>
              </ul>
            </div>
          </section>

          {/* User Accounts */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">
              User Accounts
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 mb-4">
                PariksaHub is designed to be used without requiring user accounts. However, we do have admin accounts for content management:
              </p>
              
              <div>
                <h3 className="text-lg font-semibold text-[#192A41] mb-3">Public Usage</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>No account required to use our educational services</li>
                  <li>All practice questions and tests are freely accessible</li>
                  <li>You can save questions and notes locally on your device</li>
                  <li>No personal information collection from regular users</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-[#192A41] mb-3">Admin Accounts</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Admin accounts are for content management only</li>
                  <li>Admin users must keep login credentials secure</li>
                  <li>Admin access is restricted to authorized personnel</li>
                  <li>Admin accounts are not available for public registration</li>
                </ul>
              </div>
            </div>
          </section>

          {/* AI Disclaimer */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">AI Explanations</h2>
            <div>
              <p className="text-gray-700 mb-4">
                We use Google Gemini AI to provide explanations for questions. However:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>We are NOT responsible for any misinformation</strong> provided by AI</li>
                <li>AI explanations are for educational purposes only</li>
                <li>Always verify information from reliable sources</li>
                <li>Use our regular explanations for accurate information</li>
              </ul>
            </div>
          </section>

          {/* Acceptable Use */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">
              Acceptable Use
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#192A41] mb-3">Permitted Uses</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Personal study and exam preparation</li>
                  <li>Educational purposes for students and teachers</li>
                  <li>Non-commercial use of our content</li>
                  <li>Sharing content with proper attribution</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-[#192A41] mb-3">
                  Prohibited Activities
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Attempting to hack, disrupt, or damage our systems</li>
                  <li>Using automated tools to access our services</li>
                  <li>Copying, distributing, or selling our content without permission</li>
                  <li>Creating fake accounts or impersonating others</li>
                  <li>Uploading malicious code or harmful content</li>
                  <li>Violating any applicable laws or regulations</li>
                  <li>Interfering with other users' experience</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">Content Ownership</h2>
            <div>
              <p className="text-gray-700">
                All content on PariksaHub (questions, explanations, designs) is owned by us and protected by copyright laws. You may use our content for personal study only.
              </p>
            </div>
          </section>

          {/* Privacy and Data */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">Privacy</h2>
            <div>
              <p className="text-gray-700">
                We don't collect personal information from regular users. Your saved questions and notes are stored only on your device. See our Privacy Policy for details.
              </p>
            </div>
          </section>

          {/* Disclaimers */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">Disclaimers</h2>
            <div>
              <p className="text-gray-700">
                Our services are provided "as is" without warranties. We cannot guarantee uninterrupted access or that all content is error-free. Use our content for educational purposes only.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">Limitation of Liability</h2>
            <div>
              <p className="text-gray-700">
                We are not liable for any damages from using our services. Use at your own risk.
              </p>
            </div>
          </section>

          {/* Termination */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">Termination</h2>
            <div>
              <p className="text-gray-700">
                You can stop using our services anytime. We may stop providing services at any time.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">Governing Law</h2>
            <div>
              <p className="text-gray-700">
                These Terms are governed by the laws of India. Any disputes will be handled in Indian courts.
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">Changes to Terms</h2>
            <div>
              <p className="text-gray-700">
                We may update these Terms anytime. Continued use means you accept the changes.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-3xl font-bold text-[#192A41] mb-6">Contact Us</h2>
            <div>
              <p className="text-lg mb-4">
                If you have any questions about these Terms of Use, please contact us:
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
                  href="/privacy-policy" 
                  className="text-gray-600 hover:text-gray-800"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsOfUse;
