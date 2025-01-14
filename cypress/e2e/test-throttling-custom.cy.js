/// <reference types="cypress" />

import '../../src/commands/index'
Cypress.config('defaultCommandTimeout', 15000)
const url = `https://playwright.dev`

describe('Performance with network throttling', () => {
  it(`using custom options`, () => {
    cy.setNetworkConditions({
      downloadThroughput: (250 * 1024) / 8, // 250 Kbps
      uploadThroughput: (250 * 1024) / 8, // 250 Kbps
      latency: 200 // ms
    })
    cy.visit(url)
    cy.performance().then((metrics) => {
      cy.task('save', metrics)
      expect(metrics.pageloadTiming).to.be.greaterThan(30000)
      expect(metrics.domCompleteTiming).to.be.greaterThan(30000)
    })
    cy.resetNetworkConditions()
  })
})
