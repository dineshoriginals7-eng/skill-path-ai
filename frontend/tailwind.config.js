/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        heading: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Manrope", "ui-sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace"],
      },
      colors: {
        // Core Monochrome Palette Variables
        "bg-primary": "#090909",
        "bg-secondary": "#171717",
        "card": "#141414",
        "text-primary": "#FFFFFF",
        "text-secondary": "#A1A1AA",
        "border-color": "#292929",

        // Monochrome System Replacements for Brand/Violet
        brand: {
          50:  "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#ffffff",
          600: "#ffffff",
          700: "#d4d4d8",
          800: "#27272a",
          900: "#18181b",
          950: "#090909",
        },
        violet: {
          400: "#a1a1aa",
          500: "#d4d4d8",
          600: "#ffffff",
        },
        surface: {
          DEFAULT: "#090909",
          50:  "#171717",
          100: "#171717",
          200: "#202020",
          300: "#262626",
          400: "#2e2e2e",
          card: "#141414",
          border: "#292929",
        },
        success: {
          DEFAULT: "#10b981",
          light: "#d1fae5",
          dark: "#064e3b",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fef3c7",
          dark: "#78350f",
        },
        danger: {
          DEFAULT: "#ef4444",
          light: "#fee2e2",
          dark: "#7f1d1d",
        },
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%)",
        "gradient-dark": "linear-gradient(180deg, #090909 0%, #171717 100%)",
        "gradient-card": "linear-gradient(180deg, #171717 0%, #141414 100%)",
        "gradient-glow": "radial-gradient(ellipse at top, rgba(255,255,255,0.06) 0%, transparent 70%)",
      },
      boxShadow: {
        "brand": "0 0 0 1px #292929",
        "card": "0 1px 3px rgba(0,0,0,0.5)",
        "glow-sm": "none",
        "glow-md": "none",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "shimmer": "shimmer 1.5s infinite linear",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
