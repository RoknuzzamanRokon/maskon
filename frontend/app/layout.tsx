import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./contexts/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Mashkon Vibes",
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
                  <h3 className="text-xl font-bold mb-4">Mashkon Vibes</h3>
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
                    <li>
                      <a
                        href="https://wa.me/8801739933258?text=Hello!%20I%20would%20like%20to%20get%20in%20touch."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-white transition-colors flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63z"/>
                        </svg>
                        WhatsApp
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
                  <p className="text-gray-300 text-sm">📧 mashkon@gmail.com</p>
                  <p className="text-gray-300">📱 WhatsApp: +880 173 99 33258</p>
                </div>
              </div>
              <div className="border-t border-gray-700 pt-8 text-center">
                <p className="text-gray-300">
                  &copy; 2025 Mashkon Vibes. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
