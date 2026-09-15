/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}', './*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lavender: {
          50: '#F7F5FF',   // Soft Lavender Background
          100: '#F0ECFF',  // Light Lavender Active State / Badge Fill
          200: '#E9E5F5',  // Subtle Lavender Border
          300: '#D8CFFC',  // Soft Accent Line
          400: '#B8A5FB',  // Light Purple Highlight
          500: '#A78BFA',  // Primary Lavender Accent
          600: '#8B5CF6',  // Stronger Purple Accent
          700: '#6D5AE6',  // Deep Purple
          800: '#5B48D9',  // Darker Purple Text
          900: '#4835B5',  // Midnight Purple
        },
        dental: {
          text: '#263238',      // Primary Text
          secondary: '#667085', // Secondary Subtext
          border: '#E9E5F5',    // Soft Border
          bg: '#FAFAFD',        // Soft Page Background
          card: '#FFFFFF',      // White Card Surface
          accent: '#8B5CF6',    // Primary Accent
          soft: '#F7F5FF',      // Faint Lavender Accent
          success: '#10B981',   // Success Green
          warning: '#F59E0B',   // Warning Amber
          error: '#EF4444',     // Error Red
        },
        brand: {
          blue: '#2563EB',
          teal: '#14B8A6',
          bg: '#F8FAFC',
          card: '#FFFFFF',
          text: '#263238',
          success: '#10B981',
          error: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft-purple': '0 4px 20px rgba(100, 80, 180, 0.06)',
        'soft-card': '0 2px 12px rgba(100, 80, 180, 0.04)',
        'purple-glow': '0 0 25px rgba(139, 92, 246, 0.15)',
        'modal-lg': '0 12px 40px rgba(100, 80, 180, 0.12)',
      },
      borderRadius: {
        'card': '18px',
        'btn': '11px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-reverse': 'floatReverse 7s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.99)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(2deg)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(10px) rotate(-2deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.03)' },
        },
        skeleton: {
          '0%': { opacity: '0.6' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};

