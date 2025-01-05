/// <reference types="cypress" />
import '../../src/commands/index'
Cypress.config('defaultCommandTimeout', 15000)
describe('Performance with one unified command', () => {
  const url = `https://playwright.dev`
  it(`Should load ${url} page in less than 2 second`, () => {
    cy.visit(url)
    cy.performance().then((metrics) => {
      cy.log(`pageloadTiming: ${metrics.pageloadTiming}ms`)
      cy.log(`domCompleteTiming: ${metrics.domCompleteTiming}ms`)
      expect(metrics.pageloadTiming).to.be.lessThan(2000)
      expect(metrics.domCompleteTiming).to.be.lessThan(2000)
    })
  })
  it(`Should load ${url} page with timeToFirstByte less than 500ms`, () => {
    cy.visit(url)
    cy.performance({ retryTimeout: 1000 }).then((metrics) => {
      cy.log(`Time to first byte: ${metrics.timeToFirstByte.total}ms`)
      expect(metrics.timeToFirstByte.total, 'Time to first byte is less than 500ms').to.be.lessThan(500)
      expect(metrics.timeToFirstByte.dns, 'DNS time is less than 20ms').to.be.lessThan(20)
      expect(metrics.timeToFirstByte.wait, 'Wait time is less than 50ms').to.be.lessThan(50)
      expect(metrics.timeToFirstByte.redirect, 'Redirect time is less than 50ms').to.be.lessThan(50)
      expect(metrics.timeToFirstByte.tls, 'TLS time is less than 50ms').to.be.lessThan(50)
      expect(metrics.timeToFirstByte.connection, 'Connection time is less than 50ms').to.be.lessThan(50)
    })
  })
  it(`Should load ${url} page with resourceTiming less than 500ms`, () => {
    cy.visit(url)
    cy.performance({ retryTimeout: 1000 }).then((metrics) => {
      cy.log(`Resource timing: ${metrics.resourceTiming('.svg')?.duration}ms`)
      expect(metrics.resourceTiming('.svg')?.duration, 'Resource timing is less than 500ms').to.be.lessThan(500)
    })
  })
  it(`Should load ${url} page with size less than 1.5 MB`, () => {
    cy.visit(url)
    cy.performance({ endMark: 'domComplete', timeout: 2000 }).then((results) => {
      cy.log(`Total bytes: ${results.totalBytes} bytes`)
      expect(results.totalBytes, 'Total bytes is less than 1.5 MB').to.be.lessThan(1024 * 1024 * 1.5)
    })
  })
  it(`Should measure paint timings for ${url}`, () => {
    cy.visit(url)
    cy.performance({ endMark: 'domComplete', retryTimeout: 2000 }).then((results) => {
      cy.log(`First Contentful Paint time: ${results.paint.firstContentfulPaint}ms`)
      cy.log(`First Paint timing: ${results.paint.firstPaint}ms`)
      expect(results.paint.firstContentfulPaint, 'First Contentful Paint is less than 1500ms').to.be.lessThan(1500)
      expect(results.paint.firstPaint, 'First Paint is less than 1500ms').to.be.lessThan(1500)
    })
  })
  it(`Should measure largestContentfulPaint for ${url}`, () => {
    cy.visit(url)
    cy.performance().then((results) => {
      cy.log(`Largest Contentful Paint timing: ${results.largestContentfulPaint}ms`)
      expect(
        results.largestContentfulPaint,
        `Largest Contentful Paint (${results.largestContentfulPaint}ms) should be less than 500ms`,
      ).to.be.lessThan(500)
    })
  })
  it(`Should measure cumulativeLayoutShift for ${url}`, () => {
    cy.visit(url)
    cy.performance().then((results) => {
      cy.log(`Cumulative Layout Shift: ${results.cumulativeLayoutShift}`)
      expect(
        results.cumulativeLayoutShift,
        `Cumulative Layout Shift (${results.cumulativeLayoutShift}) should be less than 0.1`,
      ).to.be.lessThan(0.1)
    })
  })
  it(`Should measure totalBlockingTime for ${url}`, () => {
    cy.visit(url)
    cy.performance().then((results) => {
      cy.log(`Total Blocking Time: ${results.totalBlockingTime}ms`)
      expect(
        results.totalBlockingTime,
        `Total Blocking Time (${results.totalBlockingTime}ms) should be less than 500ms`,
      ).to.be.lessThan(500)
    })
  })
})
