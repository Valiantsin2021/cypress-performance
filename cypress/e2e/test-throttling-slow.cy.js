/// <reference types="cypress" />

import '../../src/commands/index'
Cypress.config('defaultCommandTimeout', 15000)
const url = `https://playwright.dev`

describe.only('Performance with network throttling', () => {
  it(`using preset SLOW_3G`, () => {
    cy.setNetworkConditions('SLOW_3G')
    cy.visit(url)
    cy.performance().then((metrics) => {
      cy.task('save', metrics)
      expect(metrics.pageloadTiming).to.be.greaterThan(12000)
      expect(metrics.domCompleteTiming).to.be.greaterThan(12000)
    })
    cy.resetNetworkConditions()
  })
})
