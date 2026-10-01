/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#08080b', 1: '#0d0d12', 2: '#131319', 3: '#1a1a22' },
        line: { DEFAULT: '#ffffff14', 2: '#ffffff2b' },
        fg: { DEFAULT: '#f4f4f6', 2: '#a2a2b0', 3: '#6b6b7d' },
        accent: { DEFAULT: '#8b5cf6', 2: '#a78bfa' },
        info: '#22d3ee',
        ok: '#a3e635',
        warn: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        control: '10px',
      },
      boxShadow: {
        pop: '0 20px 40px -16px rgba(0,0,0,0.7)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'dot-pulse': { '0%, 80%, 100%': { opacity: 0.25 }, '40%': { opacity: 1 } },
      },
      animation: {
        'fade-in': 'fade-in 160ms ease-out forwards',
        'dot-pulse': 'dot-pulse 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
