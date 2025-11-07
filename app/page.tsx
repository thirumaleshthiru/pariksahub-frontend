'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Target, TrendingUp, Check } from 'lucide-react';
import { useCurrentLocation } from '../utils/useCurrentLocation';
import JsonLdSchema from '../components/JsonLdSchema';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pariksahub.com';

const homePageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'PariksaHub - Practice for Competitive Exams, Interview',
  description: 'PariksaHub is a free platform to prepare for competitive exams like RRB, SSC, and other general competitive exams. We provide aptitude questions and answers, reasoning, programming, and mathematics MCQs for JEE and more.',
  url: baseUrl,
  mainEntity: {
    '@type': 'EducationalOrganization',
    name: 'PariksaHub',
    description: 'Free platform for competitive exam preparation',
  },
};

const Home = () => {
  const [, currentUrl] = useCurrentLocation();

  return (
    <>
      <JsonLdSchema schema={homePageSchema} id="home-schema" />
      <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="bg-[#192A41] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="inline-block px-5 py-2.5 bg-[#C0A063] rounded-full mb-6">
                <span className="text-white text-sm font-semibold">Trusted by 10,000+ Students</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl md:text-[2.25rem] md:leading-[1.2] font-bold text-white mb-6 leading-tight">
                Prepare for Competitive Exams with Confidence
              </h1>
              
              <p className="text-base sm:text-lg text-gray-100 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Practice smarter with our comprehensive question bank designed for SSC, RRB, Banking, and more.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/practice"
                  className="bg-[#C0A063] text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-opacity-90 transition-all inline-flex items-center justify-center group"
                >
                  Start Practicing Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative flex justify-center lg:justify-end order-1 lg:order-2 mt-8 lg:mt-0">
              <div className="relative">
                <div className="absolute -inset-4 bg-[#C0A063] opacity-20 rounded-full blur-3xl"></div>
                <Image 
                  alt="PariksaHub mascot owl" 
                  className="w-64 sm:w-80 lg:w-96 rounded-2xl relative z-10 shadow-2xl" 
                  src="/assets/PariksaHub.png"
                  width={384}
                  height={384}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-[1.75rem] font-bold mb-4">
              <span className="text-[#192A41]">Everything you need to </span>
              <span className="text-[#C0A063]">top competitive exams</span>
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="bg-white border-2 border-gray-300 p-6 sm:p-8 rounded-lg shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-[#C0A063] rounded-lg flex items-center justify-center mb-5">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Comprehensive Library
              </h3>
              <p className="text-gray-900 leading-relaxed">
                Extensive collection of practice questions covering all major competitive exam topics and patterns.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border-2 border-gray-300 p-6 sm:p-8 rounded-lg shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-[#C0A063] rounded-lg flex items-center justify-center mb-5">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Real-time Testing
              </h3>
              <p className="text-gray-900 leading-relaxed">
                Simulate actual exam conditions with timed tests and get instant detailed performance analytics.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border-2 border-gray-300 p-6 sm:p-8 rounded-lg shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-[#C0A063] rounded-lg flex items-center justify-center mb-5">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Targeted Practice
              </h3>
              <p className="text-gray-900 leading-relaxed">
                Focus on specific topics and weak areas with our intelligent topic-wise question system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Topics Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="section-title text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-[#192A41]">Popular </span>
              <span className="text-[#C0A063]">Practice Areas</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto">
              Master the core subjects that matter most
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Topic 1 */}
            <Link href="/practice/general-aptitude" className="block group">
              <div className="bg-white border-2 border-gray-300 p-6 sm:p-8 rounded-lg hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#192A41] mb-2">Aptitude</h3>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      Quantitative reasoning, data interpretation, and logical problem solving
                    </p>
                  </div>
                  <span className="text-4xl font-bold text-[#C0A063] opacity-20 group-hover:opacity-100 transition-opacity">
                    01
                  </span>
                </div>
                <div className="flex items-center text-[#C0A063] font-semibold text-sm group-hover:gap-2 transition-all">
                  Start Practice
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>

            {/* Topic 2 */}
            <Link href="/practice/logical-reasoning" className="block group">
              <div className="bg-white border-2 border-gray-300 p-6 sm:p-8 rounded-lg hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#192A41] mb-2">Reasoning</h3>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      Logical reasoning, verbal reasoning, and analytical thinking skills
                    </p>
                  </div>
                  <span className="text-4xl font-bold text-[#C0A063] opacity-20 group-hover:opacity-100 transition-opacity">
                    02
                  </span>
                </div>
                <div className="flex items-center text-[#C0A063] font-semibold text-sm group-hover:gap-2 transition-all">
                  Start Practice
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>

            {/* Topic 3 */}
            <Link href="/practice/computer-science" className="block group">
              <div className="bg-white border-2 border-gray-300 p-6 sm:p-8 rounded-lg hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#192A41] mb-2">Computer Science</h3>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      Core CS principles including OS, Compiler Design, DBMS, and algorithms
                    </p>
                  </div>
                  <span className="text-4xl font-bold text-[#C0A063] opacity-20 group-hover:opacity-100 transition-opacity">
                    03
                  </span>
                </div>
                <div className="flex items-center text-[#C0A063] font-semibold text-sm group-hover:gap-2 transition-all">
                  Start Practice
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#192A41] relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            <span className="text-white">Ready to Transform Your </span>
            <span className="text-[#C0A063]">Exam Preparation?</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of successful candidates who chose PariksaHub to achieve their career goals.
          </p>
          
          <Link 
            href="/practice"
            className="inline-flex items-center justify-center bg-[#C0A063] text-white font-semibold px-10 py-4 rounded-lg hover:bg-opacity-90 transition-all group"
          >
            Start Your Journey
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex items-start text-left">
              <Check className="w-5 h-5 text-[#C0A063] mr-3 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-gray-900 mb-1">Free Access</div>
                <div className="text-sm text-gray-700">No hidden charges</div>
              </div>
            </div>
            <div className="flex items-start text-left">
              <Check className="w-5 h-5 text-[#C0A063] mr-3 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-gray-900 mb-1">Expert Content</div>
                <div className="text-sm text-gray-700">Curated by professionals</div>
              </div>
            </div>
            <div className="flex items-start text-left">
              <Check className="w-5 h-5 text-[#C0A063] mr-3 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-gray-900 mb-1">24/7 Available</div>
                <div className="text-sm text-gray-700">Practice anytime</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default Home;
