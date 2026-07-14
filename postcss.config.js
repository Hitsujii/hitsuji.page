module.exports = {
  plugins: {
    // Next.js performs the final minification after the scoped vendor CSS is normalized.
    '@tailwindcss/postcss': { optimize: false },
    './scripts/postcss-normalize-98css-media-query.js': {},
    'postcss-prefix-selector': {
      prefix: '.retro98',
      includeFiles: [/css[\\/]retro98\.css$/],
    },
  },
}
