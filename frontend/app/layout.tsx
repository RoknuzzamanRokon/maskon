import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./contexts/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Maskon Vibes",
  description: "Tech, Food, and Activity Blog with Portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-white dark:bg-gray-900 transition-colors duration-300`}
      >
        <ThemeProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <footer className="bg-gray-800 dark:bg-gray-950 text-white py-8">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-4 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Maskon Vibes</h3>
                  <p className="text-gray-300 text-sm">
                    Sharing insights on technology, food, and daily activities.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Quick Links</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="/"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Home
                      </a>
                    </li>
                    <li>
                      <a
                        href="/blog"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Blog
                      </a>
                    </li>
                    <li>
                      <a
                        href="/portfolio"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Portfolio
                      </a>
                    </li>
                    <li>
                      <a
                        href="/contact"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Contact
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Categories</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="/blog/category/tech"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        🚀 Tech
                      </a>
                    </li>
                    <li>
                      <a
                        href="/blog/category/food"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        🍕 Food
                      </a>
                    </li>
                    <li>
                      <a
                        href="/blog/category/activity"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        🏃 Activity
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Connect</h4>
                  <div className="flex space-x-3 mb-4">
                    <a
                      href="https://twitter.com/maskon"
                      className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                    >
                      🐦
                    </a>
                    <a
                      href="https://linkedin.com/in/maskon"
                      className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors"
                    >
                      💼
                    </a>
                    <a
                      href="https://github.com/maskon"
                      className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                    >
                      💻
                    </a>
                  </div>
                  <p className="text-gray-300 text-sm">📧 maskon@gmail.com</p>
                </div>
              </div>
              <div className="border-t border-gray-700 pt-8 text-center">
                <p className="text-gray-300">
                  &copy; 2025 Maskon Vibes. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
