module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0a0a0f',
          card: '#12121a',
          surface: '#1a1a24'
        },
        neon: {
          DEFAULT: '#00ff88',
          dim: '#00cc6a'
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'pulse-purple': 'pulse-purple 2s ease-in-out infinite',
        'gradient': 'gradient-shift 4s ease infinite',
        'slide-up': 'slide-up 0.6s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.6s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.4s ease-out forwards',
        'shimmer': 'shimmer 2s infinite',
        'glow-border': 'glow-border 2s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 255, 136, 0.3), 0 0 40px rgba(0, 255, 136, 0.1)',
        'neon-lg': '0 0 20px rgba(0, 255, 136, 0.4), 0 0 60px rgba(0, 255, 136, 0.15)',
        'purple': '0 0 10px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1)',
        'purple-lg': '0 0 20px rgba(139, 92, 246, 0.4), 0 0 60px rgba(139, 92, 246, 0.15)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      }
    }
  },
  plugins: []
};
