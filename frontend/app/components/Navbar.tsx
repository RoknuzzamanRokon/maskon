"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link
            href="/"
            className="group relative text-3xl font-extrabold text-gray-800 tracking-wide"
          >
            <span className="relative z-10 inline-block py-1">
              <span className="block text-animate bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                Maskon
              </span>

              <span className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 w-full underline-animate"></span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-600 hover:text-gray-800">
              Home
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-gray-800">
              Blog
            </Link>
            <Link
              href="/blog/category/tech"
              className="text-gray-600 hover:text-gray-800"
            >
              Tech
            </Link>
            <Link
              href="/blog/category/food"
              className="text-gray-600 hover:text-gray-800"
            >
              Food
            </Link>
            <Link
              href="/blog/category/activity"
              className="text-gray-600 hover:text-gray-800"
            >
              Activity
            </Link>
            <Link
              href="/portfolio"
              className="text-gray-600 hover:text-gray-800"
            >
              Portfolio
            </Link>
            <Link
              href="/admin"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <Link
              href="/"
              className="block py-2 text-gray-600 hover:text-gray-800"
            >
              Home
            </Link>
            <Link
              href="/blog"
              className="block py-2 text-gray-600 hover:text-gray-800"
            >
              Blog
            </Link>
            <Link
              href="/blog/category/tech"
              className="block py-2 text-gray-600 hover:text-gray-800"
            >
              Tech
            </Link>
            <Link
              href="/blog/category/food"
              className="block py-2 text-gray-600 hover:text-gray-800"
            >
              Food
            </Link>
            <Link
              href="/blog/category/activity"
              className="block py-2 text-gray-600 hover:text-gray-800"
            >
              Activity
            </Link>
            <Link
              href="/portfolio"
              className="block py-2 text-gray-600 hover:text-gray-800"
            >
              Portfolio
            </Link>
            <Link
              href="/admin"
              className="block py-2 text-blue-600 hover:text-blue-800"
            >
              Admin
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
