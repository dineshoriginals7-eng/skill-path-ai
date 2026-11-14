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
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Outfit", "ui-sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace"],
      },
      colors: {
        // SkillPath AI Design System
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",   // Primary indigo
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        violet: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        surface: {
          DEFAULT: "#0f1117",
          50:  "#f8f9fb",
          100: "#1a1d27",
          200: "#21242f",
          300: "#282c3a",
          400: "#343846",
          card: "#1a1d27",
          border: "#2a2d3a",
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
        "gradient-brand": "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        "gradient-dark": "linear-gradient(135deg, #0f1117 0%, #1a1d27 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.08) 100%)",
        "gradient-glow": "radial-gradient(ellipse at top, rgba(99,102,241,0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        "brand": "0 0 0 1px rgba(99,102,241,0.3), 0 4px 24px rgba(99,102,241,0.15)",
        "card": "0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)",
        "glow-sm": "0 0 12px rgba(99,102,241,0.3)",
        "glow-md": "0 0 24px rgba(99,102,241,0.4)",
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
