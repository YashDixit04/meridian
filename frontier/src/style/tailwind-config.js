window.tailwind = window.tailwind || {};
window.tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          active: 'var(--primary-active)',
          accent: 'var(--primary-accent)',
          transparent: 'var(--primary-transparent)',
          soft: 'var(--primary-soft)',
        },
        success: {
          DEFAULT: 'var(--success)',
          active: 'var(--success-active)',
          accent: 'var(--success-accent)',
          transparent: 'var(--success-transparent)',
          soft: 'var(--success-soft)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          active: 'var(--danger-active)',
          accent: 'var(--danger-accent)',
          transparent: 'var(--danger-transparent)',
          soft: 'var(--danger-soft)',
        },
        info: {
          DEFAULT: 'var(--info)',
          active: 'var(--info-active)',
          accent: 'var(--info-accent)',
          transparent: 'var(--info-transparent)',
          soft: 'var(--info-soft)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          active: 'var(--warning-active)',
          accent: 'var(--warning-accent)',
          transparent: 'var(--warning-transparent)',
          soft: 'var(--warning-soft)',
        },
        dark: {
          DEFAULT: 'var(--dark)',
          active: 'var(--dark-active)',
          transparent: 'var(--dark-transparent)',
          soft: 'var(--dark-soft)',
        },
        light: {
          DEFAULT: 'var(--light)',
          active: 'var(--light-active)',
          transparent: 'var(--light-transparent)',
          soft: 'var(--light-soft)',
        },
        grey: {
          50: 'var(--grey-50)',
          100: 'var(--grey-100)',
          200: 'var(--grey-200)',
          300: 'var(--grey-300)',
          400: 'var(--grey-400)',
          500: 'var(--grey-500)',
          600: 'var(--grey-600)',
          700: 'var(--grey-700)',
          800: 'var(--grey-800)',
          900: 'var(--grey-900)',
          950: 'var(--grey-950)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
};
