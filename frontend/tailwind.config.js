/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0B0F17",
          card: "#111827",
          hover: "#1F2937",
          border: "#1E293B",
          input: "#0F172A",
          muted: "#94A3B8"
        },
        brand: {
          primary: "#6366F1",
          secondary: "#4F46E5",
          accent: "#818CF8",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#EF4444",
          cyan: "#06B6D4"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
