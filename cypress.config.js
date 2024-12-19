const { defineConfig } = require('cypress')
// https://github.com/Valiantsin2021/cypress-performance

module.exports = defineConfig({
  e2e: {
    // baseUrl, etc
    viewportHeight: 1600,
    viewportWidth: 1200,
    supportFile: false,
    setupNodeEvents(on, config) {
      return config
    }
  }
})
