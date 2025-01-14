/// <reference types="cypress" />

import '../../src/commands/index'
Cypress.config('defaultCommandTimeout', 15000)
const url = `https://playwright.dev`

describe('Performance with network throttling', () => {
  it(`using preset FAST_WIFI`, () => {
    cy.setNetworkConditions('FAST_WIFI')
    cy.visit(url)
    cy.performance().then((metrics) => {
      cy.task('save', metrics)
      expect(metrics.pageloadTiming).to.be.lessThan(5000)
      expect(metrics.domCompleteTiming).to.be.lessThan(5000)
    })
    cy.resetNetworkConditions()
  })
  it(`using preset REGULAR_4G`, () => {
    cy.setNetworkConditions('REGULAR_4G')
    cy.visit(url)
    cy.performance().then((metrics) => {
      cy.task('save', metrics)
      expect(metrics.pageloadTiming).to.be.greaterThan(2000)
      expect(metrics.domCompleteTiming).to.be.greaterThan(2000)
    })
    cy.resetNetworkConditions()
  })
})
