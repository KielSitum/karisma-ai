/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5B4FE8',
          dark:    '#3D35B5',
          light:   '#EEEDFE',
          mid:     '#8B85F0',
        },
        surface: '#FFFFFF',
        bg:      '#F4F5FB',
        border:  '#E8EAF2',
        muted:   '#9EA3BC',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        card:  '0 1px 3px rgba(91,79,232,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        md:    '0 4px 16px rgba(91,79,232,0.10), 0 2px 8px rgba(0,0,0,0.04)',
        lg:    '0 8px 32px rgba(91,79,232,0.14), 0 4px 16px rgba(0,0,0,0.06)',
        glow:  '0 6px 20px rgba(91,79,232,0.35)',
      },
      animation: {
        'fade-up':  'fadeUp 0.5s ease both',
        'fade-in':  'fadeIn 0.3s ease both',
        'float':    'float 4s ease-in-out infinite',
        'spin-slow':'spin 0.8s linear infinite',
        'pulse-dot':'pulse 1.2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:  { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        float:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
    },
  },
  plugins: [],
}