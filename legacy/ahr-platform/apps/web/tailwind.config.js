/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Ratified 2026-07-21 (Decision Log B10/C1) — mirrors
      // ahmedhamdyraouf.com's own palette; see globals.css for the
      // literal hex values (single source of truth, referenced via CSS
      // custom properties so both Tailwind classes and plain CSS stay
      // in sync automatically).
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        neutral: "var(--color-neutral)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        info: "var(--color-info)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};
