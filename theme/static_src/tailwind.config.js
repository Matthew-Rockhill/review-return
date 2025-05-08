// tailwind.config.js
module.exports = {
    content: [
      '../templates/**/*.html',
      '../../templates/**/*.html',
      '../../**/templates/**/*.html',
    ],
    theme: {
        extend: {
          colors: {
            primary: '#2563EB',
            secondary: '#1F2937',
            accent: '#FBBF24',
            neutral: '#F9FAFB',
            card: '#FFFFFF',
            success: '#10B981',
          },
          fontFamily: {
            sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
          },
        },
      },
    plugins: [
      require('@tailwindcss/forms'),
      require('@tailwindcss/typography'),
      require('@tailwindcss/aspect-ratio'),
    ],
  }
  