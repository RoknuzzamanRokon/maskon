/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      keyframes: {
        // Red bip animation that triggers every 3 seconds
        "red-bip": {
          "0%, 97%, 100%": {
            opacity: "0",
            backgroundColor: "rgba(239, 68, 68, 0)",
          },
          "98%, 99%": {
            opacity: "0.3",
            backgroundColor: "rgba(239, 68, 68, 3)",
          },
        },
        // Red dot animation with 3-second interval
        "red-bip-dot": {
          "0%, 97%, 100%": {
            opacity: "0.5",
            transform: "scale(1)",
          },
          "98%, 99%": {
            opacity: "1",
            transform: "scale(1.5)",
          },
        },
        // Enhanced shimmer effect
        "shimmer-sweep": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "red-bip": "red-bip 3s ease-in-out infinite",
        "red-bip-dot": "red-bip-dot 3s ease-in-out infinite",
        "shimmer-sweep": "shimmer-sweep 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
