import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/state/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#093C5D",
        panel: "#EFFBFC",
        line: "#B9E9EE",
        brand: {
          50: "#E6FFFB",
          100: "#C9FFF4",
          500: "#5DF8D8",
          600: "#2ECBB4",
          700: "#0E8E83"
        },
        accent: {
          50: "#EEF9FA",
          100: "#D7F4F6",
          500: "#6FD1D7",
          600: "#3B7597",
          700: "#093C5D"
        },
        caution: {
          50: "#EEF9FA",
          100: "#D7F4F6",
          500: "#6FD1D7",
          600: "#3B7597"
        }
      },
      boxShadow: {
        soft: "0 18px 45px rgba(9, 60, 93, 0.12)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
