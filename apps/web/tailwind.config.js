/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        sev: {
          pathetic: "#b91c1c",
          weak: "#ea580c",
          mid: "#ca8a04",
          decent: "#2563eb",
          fortress: "#16a34a",
        },
      },
    },
  },
  plugins: [],
};
