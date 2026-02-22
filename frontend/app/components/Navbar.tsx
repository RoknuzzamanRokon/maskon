"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isLoggedIn, getUserInfo, logout } from "../lib/api";
import { useTheme } from "../contexts/ThemeContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const blogDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  const isActivePath = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
  const isBlogActive = pathname === "/blog" || pathname.startsWith("/blog/");
  const isPortfolioActive =
    pathname === "/portfolio" || pathname.startsWith("/portfolio/");
  const isProjectsActive =
    pathname === "/projects" || pathname.startsWith("/projects/");
  const isContactActive =
    pathname === "/contact" || pathname.startsWith("/contact/");
  const isProductsActive =
    pathname === "/products" || pathname.startsWith("/products/");

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

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileToggleRef.current &&
        mobileToggleRef.current.contains(event.target as Node)
      ) {
        return;
      }
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

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("scroll", handleScroll);
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
    <nav
      className={`sticky top-0 lg:fixed w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg"
          : "bg-transparent"
      }`}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isScrolled ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="group relative flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                MASHKON
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wider">
                INNOVATION & DESIGN
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              href="/"
              className={`group relative px-4 py-2.5 rounded-xl transition-all duration-300 ${
                isActivePath("/")
                  ? "text-blue-600 dark:text-blue-400 font-bold text-lg"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 rounded-xl group-hover:from-blue-500/5 group-hover:to-violet-500/5 transition-all duration-300"></div>
            </Link>

            {/* Blog Dropdown */}
            <div className="relative" ref={blogDropdownRef}>
              <button
                onClick={() => setIsBlogOpen(!isBlogOpen)}
                className={`group relative px-4 py-2.5 rounded-xl flex items-center space-x-1 transition-all duration-300 ${
                  isBlogActive
                    ? "text-blue-600 dark:text-blue-400 font-bold text-lg"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>Blog</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
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
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 rounded-xl group-hover:from-blue-500/5 group-hover:to-violet-500/5 transition-all duration-300"></div>
              </button>

              {isBlogOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl py-3 z-50 animate-fadeIn">
                  <div className="px-4 py-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Categories
                    </span>
                  </div>
                  <div className="border-t border-gray-200/50 dark:border-gray-700/50 mb-2"></div>

                  <Link
                    href="/blog"
                    className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 group"
                    onClick={() => setIsBlogOpen(false)}
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full mr-3"></div>
                    <span>All Posts</span>
                    <svg
                      className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>

                  {[
                    {
                      href: "/blog/category/tech",
                      label: "Technology",
                      color: "blue",
                    },
                    {
                      href: "/blog/category/food",
                      label: "Culinary Arts",
                      color: "emerald",
                    },
                    {
                      href: "/blog/category/activity",
                      label: "Lifestyle",
                      color: "violet",
                    },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 group"
                      onClick={() => setIsBlogOpen(false)}
                    >
                      <div
                        className={`w-2 h-2 bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 rounded-full mr-3`}
                      ></div>
                      <span>{item.label}</span>
                      <svg
                        className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {[
              { href: "/portfolio", label: "Portfolio", active: isPortfolioActive },
              { href: "/projects", label: "Projects", active: isProjectsActive },
              { href: "/contact", label: "Contact", active: isContactActive },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative px-4 py-2.5 rounded-xl transition-all duration-300 ${
                  item.active
                    ? "text-blue-600 dark:text-blue-400 font-bold text-lg"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span className="relative z-10">{item.label}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 rounded-xl group-hover:from-blue-500/5 group-hover:to-violet-500/5 transition-all duration-300"></div>
              </Link>
            ))}

            {/* Products with special styling */}
            <Link
              href="/products"
              className={`group relative px-4 py-2.5 rounded-xl transition-all duration-300 ${
                isProductsActive
                  ? "text-blue-600 dark:text-blue-400 font-bold text-lg"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <span className="relative z-10 flex items-center space-x-2">
                <span>Products</span>
                <span className="px-1.5 py-0.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full animate-pulse">
                  New
                </span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-pink-500/0 rounded-xl group-hover:from-red-500/5 group-hover:to-pink-500/5 transition-all duration-300"></div>
            </Link>
          </div>

          {/* Right side actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
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
              <div className="flex items-center space-x-4">
                {/* Action buttons */}
                {!userInfo?.is_admin ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300/50 dark:border-gray-600/50 transition-all duration-300 flex items-center space-x-2 font-medium"
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
                      <span>Logout</span>
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
            onClick={() => setIsOpen(!isOpen)}
            ref={mobileToggleRef}
          >
            {isOpen ? (
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
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
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen
              ? "max-h-screen opacity-100 py-4 border-t border-gray-200/50 dark:border-gray-700/50"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-2">
            {/* Main navigation links */}
            {[
              { href: "/", label: "Home", active: isActivePath("/") },
              { href: "/portfolio", label: "Portfolio", active: isPortfolioActive },
              { href: "/projects", label: "Projects", active: isProjectsActive },
              { href: "/products", label: "Products", badge: "New", active: isProductsActive },
              { href: "/contact", label: "Contact", active: isContactActive },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 group ${
                  item.active
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-bold text-lg"
                    : "bg-gray-50/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full">
                    {item.badge}
                  </span>
                )}
                <svg
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ))}

            {/* Blog dropdown for mobile */}
            <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
              <button
                className="w-full flex items-center justify-between text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => setIsBlogOpen(!isBlogOpen)}
              >
                <span className="font-medium">Blog Categories</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
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
                  isBlogOpen ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0"
                }`}
              >
                <div className="space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                  <Link
                    href="/blog"
                    className="block py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={() => {
                      setIsOpen(false);
                      setIsBlogOpen(false);
                    }}
                  >
                    All Posts
                  </Link>
                  {[
                    {
                      href: "/blog/category/tech",
                      label: "Technology",
                      color: "blue",
                    },
                    {
                      href: "/blog/category/food",
                      label: "Culinary Arts",
                      color: "emerald",
                    },
                    {
                      href: "/blog/category/activity",
                      label: "Lifestyle",
                      color: "violet",
                    },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                      onClick={() => {
                        setIsOpen(false);
                        setIsBlogOpen(false);
                      }}
                    >
                      <div
                        className={`w-1.5 h-1.5 bg-${item.color}-500 rounded-full mr-3`}
                      ></div>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Theme toggle for mobile */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
            >
              <span className="font-medium">Theme</span>
              <div className="flex items-center space-x-2">
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

            {/* User section for mobile */}
            {loggedIn ? (
              <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg">
                    {userInfo?.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {userInfo?.username}
                    </p>
                    {userInfo?.is_admin && (
                      <span className="text-xs bg-gradient-to-r from-blue-500 to-violet-500 text-white px-2 py-1 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                </div>

                {!userInfo?.is_admin ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 font-medium"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
