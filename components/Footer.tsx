'use client';

import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const links = [
    { to: "/practice", label: "Practice" },
    { to: "/test-topics", label: "Mock Test" }
  ];

  return (
    <footer className="bg-[#192A41] text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#C0A063]">
              PariksaHub
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
                Everything you need to get better at competitive exams.          
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <div className="space-y-3">
              {links.map((link, index) => (
                <Link 
                  key={index}
                  href={link.to} 
                  className="block text-gray-300 hover:text-[#C0A063] transition duration-300 text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact Us</h4>
            <p className="text-gray-300 text-sm">Your words mean everything to us. Feel free to talk about anything, whether it is feedback, appreciation, a complaint, or a suggestion for improvement.</p>
            <div className="space-y-3">
              <a 
                href="mailto:pariksahub.feedback@gmail.com" 
                className="block text-gray-300 hover:text-[#C0A063] transition duration-300 text-sm"
              >
                pariksahub.feedback@gmail.com
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom Border and Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} PariksaHub. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link 
                href="/privacy-policy" 
                className="text-gray-400 hover:text-[#C0A063] transition duration-300 text-sm"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms-of-use" 
                className="text-gray-400 hover:text-[#C0A063] transition duration-300 text-sm"
              >
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

