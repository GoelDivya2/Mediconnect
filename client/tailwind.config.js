export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { ink: '#0e2a3b', brand: { DEFAULT: '#1769aa', dark: '#0f4c81', soft: '#e8f3fb' }, mint: '#1f9d86' },
    fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'], display: ['Fraunces', 'Georgia', 'serif'] },
    boxShadow: { card: '0 6px 24px -10px rgba(15,76,129,.25)' },
  } },
  plugins: [],
};
