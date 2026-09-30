import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        surface: {
          DEFAULT: 'hsl(var(--surface) / <alpha-value>)',
          subtle: 'hsl(var(--surface-subtle) / <alpha-value>)',
          elevated: 'hsl(var(--surface-elevated) / <alpha-value>)',
        },
        border: 'hsl(var(--border) / <alpha-value>)',
        text: {
          primary: 'hsl(var(--text-primary) / <alpha-value>)',
          muted: 'hsl(var(--text-muted) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          secondary: 'hsl(var(--accent-secondary) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
          soft8: 'var(--accent-soft-8)',
          soft12: 'var(--accent-soft-12)',
          soft16: 'var(--accent-soft-16)',
        },
        semantic: {
          success: 'hsl(var(--success) / <alpha-value>)',
          'success-bg': 'hsl(var(--success-bg) / <alpha-value>)',
          warning: 'hsl(var(--warning) / <alpha-value>)',
          'warning-bg': 'hsl(var(--warning-bg) / <alpha-value>)',
          danger: 'hsl(var(--danger) / <alpha-value>)',
          'danger-bg': 'hsl(var(--danger-bg) / <alpha-value>)',
          info: 'hsl(var(--info) / <alpha-value>)',
          'info-bg': 'hsl(var(--info-bg) / <alpha-value>)',
        },
        collab: {
          0: 'hsl(var(--collab-0) / <alpha-value>)',
          1: 'hsl(var(--collab-1) / <alpha-value>)',
          2: 'hsl(var(--collab-2) / <alpha-value>)',
          3: 'hsl(var(--collab-3) / <alpha-value>)',
          4: 'hsl(var(--collab-4) / <alpha-value>)',
          5: 'hsl(var(--collab-5) / <alpha-value>)',
          6: 'hsl(var(--collab-6) / <alpha-value>)',
          7: 'hsl(var(--collab-7) / <alpha-value>)',
          8: 'hsl(var(--collab-8) / <alpha-value>)',
          9: 'hsl(var(--collab-9) / <alpha-value>)',
          10: 'hsl(var(--collab-10) / <alpha-value>)',
          11: 'hsl(var(--collab-11) / <alpha-value>)',
        },
        // Cerebrium brand colors
        cerebrium: {
          charcoal: '#101421',
          navy: '#172b76',
          'navy-muted': '#586490',
          pink: '#ff488b',
          'pink-dark': '#f6186a',
          purple: '#e33adb',
          slate: '#eef2f5',
        },
      },
      borderRadius: {
        xs: '4px',
        sm: '7px',
        md: '10px',
        lg: '15px',
        xl: '30px',
        '2xl': '26px',
        '3xl': '34px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Newsreader', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        subtle: 'var(--shadow-subtle)',
        card: 'var(--shadow-card)',
        floating: 'var(--shadow-floating)',
        glow: 'var(--shadow-glow)',
        aurora:
          '0 0 50px -10px rgba(255, 72, 139, 0.25), 0 0 20px -5px rgba(227, 58, 219, 0.15)',
        'inner-glow': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
        'cerebrium-glow':
          '0 0 30px -5px rgba(255, 72, 139, 0.2), 0 0 60px -10px rgba(227, 58, 219, 0.1)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px -5px rgba(255, 72, 139, 0.3)' },
          '50%': { boxShadow: '0 0 40px -5px rgba(255, 72, 139, 0.5)' },
        },
      },
      animation: {
        shimmer: 'shimmer 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        glow: 'glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
