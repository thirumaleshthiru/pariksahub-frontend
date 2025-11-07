'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const mainNavLinks = [
  { to: "/practice", label: "Practice" },
  { to: "/random-topics", label: "Random Topics" },
  { to: "/test-topics", label: "Mock Test" },
  { to: "/exam-patterns", label: "Exam Patterns" },
  { to: "/cheatsheets", label: "Cheatsheets" },
  { to: "/saved", label: "Saved" }
];

function CustomNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ease-in-out ${
        scrolled ? 'bg-white shadow-lg' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between  ">
            <Link href="/" className="flex-shrink-0 group">
              <Image src="/assets/logo.png" alt="PariksaHub Logo Image" width={150} height={50} />
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <div className="flex space-x-6">
                {mainNavLinks.map((link) => (
                  <Link
                    key={link.to}
                    href={link.to}
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-all duration-300 hover:scale-105"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-gray-100 transition-all duration-300 hover:scale-110"
            >
              <span className="sr-only">Open menu</span>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out"
          onClick={() => setIsOpen(false)}
        />

        <div className={`fixed inset-y-0 right-0 w-[280px] bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-4 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-gray-100 transition-all duration-300 hover:scale-110"
            >
              <span className="sr-only">Close menu</span>
              <X size={24} />
            </button>
          </div>

          <div className="px-4 py-2">
            {mainNavLinks.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                onClick={() => setIsOpen(false)}
                className="block w-full text-left py-3 px-4 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-all duration-300 hover:scale-105"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default CustomNavbar;

