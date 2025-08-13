"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, isAdmin, getUserInfo, logout } from "../lib/api";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const logged = isLoggedIn();
      setLoggedIn(logged);
      if (logged) {
        setUserInfo(getUserInfo());
      }
    };

    checkAuth();
    // Check auth status on route changes
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setUserInfo(null);
    router.push("/");
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0">
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
          <div className="hidden md:flex items-center space-x-6">
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

            {loggedIn ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome,{" "}
                  <span className="font-semibold">{userInfo?.username}</span>
                  {userInfo?.is_admin && (
                    <span className="ml-1 text-blue-600">👑</span>
                  )}
                </span>
                {userInfo?.is_admin && (
                  <Link
                    href="/admin"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    📝 Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded hover:bg-gray-100 transition-colors"
                >
                  🚪 Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                🔐 Login
              </Link>
            )}
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
          <div className="md:hidden pb-4 border-t border-gray-200 pt-4">
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

            {loggedIn ? (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="block py-2 text-sm text-gray-600">
                  Welcome,{" "}
                  <span className="font-semibold">{userInfo?.username}</span>
                  {userInfo?.is_admin && (
                    <span className="ml-1 text-blue-600">👑</span>
                  )}
                </div>
                {userInfo?.is_admin && (
                  <Link
                    href="/admin"
                    className="block py-2 text-blue-600 hover:text-blue-800"
                  >
                    📝 Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block py-2 text-red-600 hover:text-red-800 w-full text-left"
                >
                  🚪 Logout
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <Link
                  href="/login"
                  className="block py-2 text-blue-600 hover:text-blue-800"
                >
                  🔐 Login
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
