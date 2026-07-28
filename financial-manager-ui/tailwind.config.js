/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app-bg': 'var(--bg)',
        'app-surface': 'var(--surface)',
        'app-surface-2': 'var(--surface-2)',
        'app-ink': 'var(--ink)',
        'app-muted': 'var(--muted)',
        'app-border': 'var(--border)',
        'app-accent': 'var(--accent)',
        'app-accent-ink': 'var(--accent-ink)',
        'app-accent-soft': 'var(--accent-soft)',
        'app-success': 'var(--success)',
        'app-danger': 'var(--danger)',
      },
      boxShadow: {
        'app-card': 'var(--shadow)',
      },
    },
  },
  plugins: [],
}
