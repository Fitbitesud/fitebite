import type { Config } from 'tailwindcss';

/**
 * هوية فيتبايت البصرية — الألوان مستخرجة من بوستر الهوية الرسمي:
 * أخضر زيتوني داكن + كريمي + نحاسي (الشوكة) + أخضر الأوراق
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: '#3B4728', deep: '#2A331C', soft: '#465430' },
        olive: '#55633C',
        moss: '#6C7C4A',
        leaf: '#7E9C4E',
        copper: { DEFAULT: '#A9743F', dark: '#8C5C2C' },
        orange: { DEFAULT: '#E07B2E', soft: '#F09A4E', deep: '#C05F14' },
        cream: '#EFEEE6',
        card: '#F8F7F0',
        sand: '#DFDDCF',
        ink: '#252C17',
        muted: '#6B705C',
        wa: '#25D366',
      },
      fontFamily: {
        sans: ['Cairo', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(42, 51, 28, 0.18)',
        lift: '0 24px 60px -20px rgba(42, 51, 28, 0.35)',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulsering: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.9)', opacity: '0' },
        },
      },
      animation: {
        marquee: 'marquee 26s linear infinite',
        float: 'float 5s ease-in-out infinite',
        pulsering: 'pulsering 1.8s ease-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
