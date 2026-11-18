/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 950: '#070F26', 900: '#0B1B3F', 800: '#12296B', 700: '#1E2F7A', 600: '#2B3A8C', 500: '#4153C4', 100: '#E4E8F8', 50: '#F0F2FC' },
        accent: { 600: '#0D9488', 500: '#14B8A6', 400: '#2DD4BF', 100: '#CCFBF1', 50: '#F0FDFA' },
        surface: '#F5F7FB',
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,27,63,.04), 0 10px 30px -14px rgba(11,27,63,.14)',
        lift: '0 24px 50px -22px rgba(11,27,63,.45)',
        glow: '0 10px 30px -8px rgba(20,184,166,.55)',
      },
      keyframes: {
        fade: { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'none' } },
        pop: { '0%': { transform: 'scale(.6)', opacity: 0 }, '70%': { transform: 'scale(1.08)' }, '100%': { transform: 'scale(1)', opacity: 1 } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        float: { '0%,100%': { transform: 'translateY(0) rotate(-3deg)' }, '50%': { transform: 'translateY(-10px) rotate(-3deg)' } },
        drive: { '0%': { left: '3%', opacity: 0 }, '10%': { opacity: 1 }, '90%': { opacity: 1 }, '100%': { left: '97%', opacity: 0 } },
        bob: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
      animation: {
        fade: 'fade .3s ease-out both',
        pop: 'pop .5s cubic-bezier(.2,.9,.3,1.2) both',
        float: 'float 6s ease-in-out infinite',
        drive: 'drive 7s linear infinite',
        bob: 'bob 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};