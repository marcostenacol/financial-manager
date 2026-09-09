/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
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
        'app-biz': 'rgb(var(--biz) / <alpha-value>)',
        'app-biz-soft': 'var(--biz-soft)',
      },
      boxShadow: {
        'app-card': 'var(--shadow)',
      },
    },
  },
  plugins: [],
}
