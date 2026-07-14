module.exports = function normalize98CssMediaQuery() {
  return {
    postcssPlugin: 'normalize-98css-media-query',
    OnceExit(root) {
      // Imported rules are present only after Tailwind has expanded @import.
      root.walkAtRules('media', (atRule) => {
        // 98.css uses a legacy spelling that Lightning CSS warns about.
        if (atRule.params === '(not(hover))') {
          atRule.params = '(hover: none)'
        }
      })
    },
  }
}

module.exports.postcss = true
