/// <reference types="cypress" />
import '../../src/commands/index'
Cypress.config('defaultCommandTimeout', 15000)
const results = []
const url = `https://playwright.dev`
for (let i = 1; i < 2; i++) {
  describe('Performance with one unified command ' + i, () => {
    beforeEach(() => {
      cy.visit(url)
    })
    it(i + ` Should load ${url} page in less than 2 second`, () => {
      cy.visit(url).performance().then((metrics) => {
        results.push(metrics)
        cy.task('save', metrics)
        expect(metrics.pageloadTiming).to.be.lessThan(2000)
        expect(metrics.domCompleteTiming).to.be.lessThan(2000)
      })
    })
    it(i + ` Should load ${url} page with timeToFirstByte less than 500ms`, () => {
      cy.performance({ retryTimeout: 1000 }).then((metrics) => {
        results.push(metrics)
        cy.task('save', metrics)
        expect(metrics.timeToFirstByte.total, 'Time to first byte is less than 500ms').to.be.lessThan(500)
        expect(metrics.timeToFirstByte.dns, 'DNS time is less than 20ms').to.be.lessThan(20)
        expect(metrics.timeToFirstByte.wait, 'Wait time is less than 50ms').to.be.lessThan(50)
        expect(metrics.timeToFirstByte.redirect, 'Redirect time is less than 50ms').to.be.lessThan(50)
        expect(metrics.timeToFirstByte.tls, 'TLS time is less than 100ms').to.be.lessThan(100)
        expect(metrics.timeToFirstByte.connection, 'Connection time is less than 50ms').to.be.lessThan(50)
      })
    })
    it(i + ` Should load ${url} page with resourceTiming less than 500ms`, () => {
      cy.performance({ retryTimeout: 1000 }).then((metrics) => {
        results.push(metrics)
        cy.task('save', metrics)
        expect(metrics.resourceTiming('.svg')?.duration, 'Resource timing is less than 500ms').to.be.lessThan(500)
      })
    })
    it(i + ` Should load ${url} page with size less than 1.5 MB`, () => {
      cy.performance({ endMark: 'domComplete', timeout: 2000 }).then((metrics) => {
        results.push(metrics)
        cy.task('save', metrics)
        expect(metrics.totalBytes, 'Total bytes is less than 1.5 MB').to.be.lessThan(1024 * 1024 * 1.5)
      })
    })
    it(i + ` Should measure paint timings for ${url}`, () => {
      cy.performance({ endMark: 'domComplete', retryTimeout: 2000 }).then((metrics) => {
        results.push(metrics)
        cy.task('save', metrics)
        expect(metrics.paint.firstContentfulPaint, 'First Contentful Paint is less than 1500ms').to.be.lessThan(1500)
        expect(metrics.paint.firstPaint, 'First Paint is less than 1500ms').to.be.lessThan(1500)
      })
    })
    it(i + ` Should measure largestContentfulPaint for ${url}`, () => {
      cy.performance().then((metrics) => {
        results.push(metrics)
        cy.task('save', metrics)
        expect(
          metrics.largestContentfulPaint,
          `Largest Contentful Paint (${metrics.largestContentfulPaint}ms) should be less than 500ms`
        ).to.be.lessThan(500)
      })
    })
    it(i + ` Should measure cumulativeLayoutShift for ${url}`, () => {
      cy.performance().then((metrics) => {
        results.push(metrics)
        cy.task('save', metrics)
        expect(
          metrics.cumulativeLayoutShift,
          `Cumulative Layout Shift (${metrics.cumulativeLayoutShift}) should be less than 0.1`
        ).to.be.lessThan(0.1)
      })
    })
    it(i + ` Should measure totalBlockingTime for ${url}`, () => {
      cy.performance().then((metrics) => {
        results.push(metrics)
        cy.task('save', metrics)
        expect(
          metrics.totalBlockingTime,
          `Total Blocking Time (${metrics.totalBlockingTime}ms) should be less than 500ms`
        ).to.be.lessThan(500)
      })
    })
  })
}
