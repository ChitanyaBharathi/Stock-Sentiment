/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#08080a',
        onyx: '#040406',
        carbon: '#121317',
        graphite: '#1c1d22',
        slate: '#2e3038',
        smoke: '#464853',
        ash: '#5e616e',
        steel: '#777a88',
        fog: '#9194a1',
        mist: '#acafb9',
        silver: '#c7c9d1',
        bone: '#e2e3e9',
        'paper-white': '#ffffff',
        copper: '#cc9166',
        // Kept for backward compatibility while migrating
        brandPrimary: '#08080a',
        brandAccent: '#cc9166',
        brandBg: '#08080a',
        brandText: '#e2e3e9',
        cardBg: '#040406',
        cardBgSecondary: '#121317',
        brandBorder: '#1c1d22',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"DM Serif Display"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'display': ['88px', { lineHeight: '1', letterSpacing: '0.88px' }],
        'heading-lg': ['64px', { lineHeight: '1.13', letterSpacing: '0.64px' }],
        'heading': ['52px', { lineHeight: '1.13', letterSpacing: '0.52px' }],
        'heading-sm': ['44px', { lineHeight: '1.38', letterSpacing: '0.44px' }],
        'subheading': ['24px', { lineHeight: '1', letterSpacing: '-0.31px' }],
        'body': ['20px', { lineHeight: '1.38', letterSpacing: '-0.8px' }],
        'body-sm': ['18px', { lineHeight: '1.38', letterSpacing: '-0.36px' }],
        'body-xs': ['16px', { lineHeight: '1.5' }],
        'eyebrow': ['13px', { lineHeight: '1', letterSpacing: '-0.26px' }],
      },
      backgroundImage: {
        'gilded-gradient': 'linear-gradient(103deg, rgb(174, 147, 87), rgb(255, 240, 204) 40%, rgb(174, 147, 87) 70%, rgba(189, 157, 79, 0))',
      },
      boxShadow: {
        'subtle': 'rgba(255, 255, 255, 0.2) 0px 0px 0px 1px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-33.333%)' },
        }
      }
    },
  },
  plugins: [],
}
