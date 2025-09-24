/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    screens: {
      xs: "475px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
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
        // Mobile slide animations
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-out-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        "red-bip": "red-bip 3s ease-in-out infinite",
        "red-bip-dot": "red-bip-dot 3s ease-in-out infinite",
        "shimmer-sweep": "shimmer-sweep 2s ease-in-out infinite",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "slide-out-left": "slide-out-left 0.3s ease-in",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-in",
      },
    },
  },
  plugins: [],
};
