/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',   // class-based dark mode — toggled via <html class="dark">
  theme: {
    extend: {
      colors: {
        // Semantic tokens — driven by CSS custom properties so they auto-switch
        primary:     '#2563EB',
        background:  'var(--color-bg)',
        secondaryBg: 'var(--color-secondary-bg)',
        textMain:    'var(--color-text)',
        borderMain:  'var(--color-border)',
        // Fixed palette — same in both modes
        success:     '#10B981',
        warning:     '#F59E0B',
        error:       '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
