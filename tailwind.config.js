/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0B0E14',
        surface: '#10141C',
        elevated: '#151A24',
        line: '#1E2532',
        ink: '#E7EBF3',
        dim: '#8B95A7',
        faint: '#5C6577',
        accent: '#4C8DFF',
        signal: '#E2B25A',
      },
      maxWidth: {
        content: '1400px',
      },
      borderRadius: {
        card: '10px',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      transitionDuration: {
        150: '150ms',
      },
    },
  },
  plugins: [],
};
