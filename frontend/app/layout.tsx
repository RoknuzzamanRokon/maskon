import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NavigationProvider } from "./contexts/NavigationContext";
import ConditionalLayout from "./components/ConditionalLayout";

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
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (!theme) {
                    localStorage.setItem('theme', 'dark');
                    theme = 'dark';
                  }
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} bg-white dark:bg-gray-900 transition-colors duration-300`}
      >
        <ThemeProvider>
          <NavigationProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
          </NavigationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
