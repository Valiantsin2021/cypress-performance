const { defineConfig } = require('cypress')
// https://github.com/Valiantsin2021/cypress-performance
const fs = require('fs')
module.exports = defineConfig({
  e2e: {
    // baseUrl, etc
    viewportHeight: 1920,
    viewportWidth: 1080,
    supportFile: false,
    setupNodeEvents(on, config) {
      on('task', {
        print(s) {
          console.log(s)
          return null
        },
        save(result) {
          fs.appendFileSync('results.json', JSON.stringify(result))
          return null
        }
      })
      return config
    }
  }
})
