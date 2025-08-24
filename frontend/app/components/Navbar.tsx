"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getUserInfo, logout } from "../lib/api";
import { useTheme } from "../contexts/ThemeContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const blogDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = () => {
      const logged = isLoggedIn();
      setLoggedIn(logged);
      if (logged) {
        setUserInfo(getUserInfo());
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);

    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        blogDropdownRef.current &&
        !blogDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBlogOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("storage", checkAuth);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setUserInfo(null);
    setIsOpen(false);
    router.push("/");
  };

  return (
    <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-md sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link
            href="/"
            className="group relative text-3xl font-extrabold text-gray-800 tracking-wide"
          >
            <span className="relative z-10 inline-block py-1">
              <span className="block text-animate bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                Maskon
              </span>
              <span className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 w-full underline-animate scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 py-2 px-1 relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
            </Link>

            <div className="relative" ref={blogDropdownRef}>
              <button
                onClick={() => setIsBlogOpen(!isBlogOpen)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors duration-300 py-2 px-1 relative group"
              >
                Blog
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isBlogOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
              </button>

              {isBlogOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2 z-20 animate-fadeIn">
                  <Link
                    href="/blog"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                    onClick={() => setIsBlogOpen(false)}
                  >
                    All Posts
                  </Link>
                  <div className="border-t my-1 border-gray-200 dark:border-gray-600"></div>
                  <Link
                    href="/blog/category/tech"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                    onClick={() => setIsBlogOpen(false)}
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                    Tech
                  </Link>
                  <Link
                    href="/blog/category/food"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                    onClick={() => setIsBlogOpen(false)}
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    Food
                  </Link>
                  <Link
                    href="/blog/category/activity"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                    onClick={() => setIsBlogOpen(false)}
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                    Activity
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/portfolio"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 py-2 px-1 relative group"
            >
              Portfolio
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
            </Link>

            <Link
              href="/products"
              className="relative text-gray-600 dark:text-gray-300 
             hover:text-gray-900 dark:hover:text-white 
             transition-all duration-300 py-2 px-3 rounded-lg
             group overflow-hidden"
            >
              {/* Red pulse animation that triggers every 3 seconds */}
              <span className="absolute inset-0 rounded-lg bg-red-500/0 animate-red-bip"></span>

              <span className="relative z-10 flex items-center">
                <svg
                  className="w-4 h-4 mr-1.5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                Products
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300 group-hover:w-full"></span>
              </span>

              {/* Enhanced red shimmer underline */}
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-400/30 via-red-500 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-sweep"></span>
              </span>

              {/* Red notification dot with pulse every 3 seconds */}
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-red-bip-dot"></span>
            </Link>

            <Link
              href="/contact"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 py-2 px-1 relative group"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
            </Link>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 flex items-center justify-center"
              title={
                theme === "light"
                  ? "Switch to dark mode"
                  : "Switch to light mode"
              }
            >
              {theme === "light" ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
            </button>

            {loggedIn ? (
              <div className="flex items-center space-x-4 ml-4">
                <div className="flex items-center">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                    {userInfo?.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 py-2 px-1 relative group">
                      {userInfo?.username}
                      {userInfo?.is_admin && (
                        <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {userInfo?.is_admin && (
                    <Link
                      href="/admin"
                      className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-1.5"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Admin
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 border border-gray-200"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 ml-4"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <svg
                className="w-6 h-6 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-gray-700 dark:text-gray-300"
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
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-screen opacity-100 py-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <Link
              href="/"
              className="block py-3 px-4 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>

            <div className="py-3 px-4">
              <button
                className="w-full flex justify-between items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                onClick={() => setIsBlogOpen(!isBlogOpen)}
              >
                Blog
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isBlogOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isBlogOpen ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
                }`}
              >
                <Link
                  href="/blog"
                  className="block py-2 pl-6 pr-4 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                  onClick={() => {
                    setIsOpen(false);
                    setIsBlogOpen(false);
                  }}
                >
                  All Posts
                </Link>
                <Link
                  href="/blog/category/tech"
                  className="block py-2 pl-6 pr-4 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                  onClick={() => {
                    setIsOpen(false);
                    setIsBlogOpen(false);
                  }}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                  Tech
                </Link>
                <Link
                  href="/blog/category/food"
                  className="block py-2 pl-6 pr-4 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                  onClick={() => {
                    setIsOpen(false);
                    setIsBlogOpen(false);
                  }}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  Food
                </Link>
                <Link
                  href="/blog/category/activity"
                  className="block py-2 pl-6 pr-4 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                  onClick={() => {
                    setIsOpen(false);
                    setIsBlogOpen(false);
                  }}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                  Activity
                </Link>
              </div>
            </div>

            <Link
              href="/portfolio"
              className="block py-3 px-4 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Portfolio
            </Link>

            <Link
              href="/products"
              className="block py-3 px-4 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Products
            </Link>

            <Link
              href="/contact"
              className="block py-3 px-4 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>

            {/* Theme Toggle Button - Mobile */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-between w-full py-3 px-4 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span>Theme</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {theme === "light" ? "Light" : "Dark"}
                </span>
                {theme === "light" ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                )}
              </div>
            </button>

            {loggedIn ? (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center px-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                    {userInfo?.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-800">
                      {userInfo?.username}
                      {userInfo?.is_admin && (
                        <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 px-4 mt-4">
                  {userInfo?.is_admin && (
                    <Link
                      href="/admin"
                      className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all text-center flex items-center justify-center gap-1.5"
                      onClick={() => setIsOpen(false)}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Admin
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 border border-gray-200"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-4 mt-4 px-4">
                <Link
                  href="/login"
                  className="block w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all text-center flex items-center justify-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Login to Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
