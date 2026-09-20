import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        champagne: {
          DEFAULT: "#dfba73",
          light: "#f7ebd1",
          hover: "#c59b4c",
          dark: "#a57d34",
        },
        obsidian: {
          DEFAULT: "#0c0d12",
          50: "#f6f6f8",
          100: "#ececf0",
          200: "#d5d5de",
          300: "#b0b1c0",
          400: "#84869c",
          500: "#64667d",
          600: "#4f5164",
          700: "#404151",
          800: "#1e202c",
          900: "#12131a",
          950: "#0c0d12",
        },
        alabaster: {
          DEFAULT: "#faf9f6",
          50: "#fcfbf9",
          100: "#faf9f6",
          200: "#f4f2ea",
          300: "#ebe7dc",
          400: "#ded8c8",
        },
        noir: {
          DEFAULT: "#161822",
          card: "#161822",
          bg: "#0c0d12",
          surface: "#12141c",
        },
        brand: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        display: ["var(--font-cinzel)", "Cinzel", "serif"],
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
