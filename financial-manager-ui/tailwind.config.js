/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
      },
      colors: {
        'app-bg': 'var(--bg)',
        'app-surface': 'var(--surface)',
        'app-surface-2': 'var(--surface-2)',
        'app-ink': 'rgb(var(--ink) / <alpha-value>)',
        'app-muted': 'rgb(var(--muted) / <alpha-value>)',
        'app-border': 'var(--border)',
        'app-accent': 'rgb(var(--accent) / <alpha-value>)',
        'app-accent-ink': 'var(--accent-ink)',
        'app-accent-soft': 'var(--accent-soft)',
        'app-success': 'rgb(var(--success) / <alpha-value>)',
        'app-danger': 'rgb(var(--danger) / <alpha-value>)',
      },
      boxShadow: {
        'app-card': 'var(--shadow)',
      },
    },
  },
  plugins: [],
}
