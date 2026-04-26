/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          900: "#0B5D3B",
          700: "#1F7A5C",
          500: "#38C172",
          300: "#A7E3C5",
        },
        gray: {
          900: "#1A1A1A",
          600: "#6B7280",
          200: "#E5E7EB",
        },
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        soft: "0 4px 12px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
