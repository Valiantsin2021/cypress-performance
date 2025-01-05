/// <reference types="cypress" />

/**
 * Unified command to get performance metrics or observe specific performance metrics
 * @example
 * cy.performance({ startMark: 'navigationStart', endMark: 'loadEventEnd', timeout: 10000, initialDelay: 1000, retryTimeout: 5000 })
 *   .then(results => {
 *     expect(results.pageloadTiming).to.be.lessThan(2000)
 *     expect(results.domCompleteTiming).to.be.lessThan(2000)
 *     const logoResourceTiming = results.resourceTiming('.svg')
 *     expect(logoResourceTiming.duration, 'Resource timing is less than 500ms').to.be.lessThan(500)
 *     expect(results.totalBytes, 'Total bytes is less than 500kb').to.be.lessThan(500000)
 *   })
 * @example
 * cy.performance().then(results => {
 *   expect(results.largestContentfulPaint).to.be.lessThan(500)
 *   expect(results.totalBlockingTime).to.be.lessThan(500)
 *   expect(results.paint.firstContentfulPaint).to.be.lessThan(500)
 *   expect(results.paint.firstPaint).to.be.lessThan(500)
 *   expect(results.cumulativeLayoutShift).to.be.lessThan(0.1)
 *   expect(results.timeToFirstByte.total).to.be.lessThan(100)
 *   expect(results.timeToFirstByte.dns).to.be.lessThan(20)
 *   expect(results.timeToFirstByte.wait).to.be.lessThan(50)
 * })
 */
Cypress.Commands.add('performance', (options = {}) => {
  const logFalse = { log: false }
  let metrics
  let log = Cypress.log({
    name: 'performance',
    message: 'Performance metrics collected',
    autoEnd: false,
    consoleProps() {
      return {
        command: 'performance',
        yielded: metrics,
      }
    },
  })
  const {
    startMark = 'navigationStart',
    endMark = 'loadEventEnd',
    timeout = 10000,
    initialDelay = 1000,
    retryTimeout = 5000,
  } = options
  const results = {}
  const hasValidMetrics = (results) =>
    results.largestContentfulPaint !== undefined &&
    results.paint?.firstContentfulPaint !== undefined &&
    results.paint?.firstPaint !== undefined
  return cy
    .wait(initialDelay)
    .then(() => {
      cy.window(logFalse)
        .then((win) => {
          const navigationTiming = win.performance.getEntriesByType('navigation')[0]
          if (navigationTiming) {
            results.timeToFirstByte = {
              total: navigationTiming.responseStart - navigationTiming.startTime,
              redirect: navigationTiming.redirectEnd - navigationTiming.redirectStart,
              dns: navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart,
              connection: navigationTiming.connectEnd - navigationTiming.connectStart,
              tls:
                navigationTiming.secureConnectionStart > 0
                  ? navigationTiming.connectEnd - navigationTiming.secureConnectionStart
                  : 0,
              wait: navigationTiming.responseStart - navigationTiming.requestStart,
            }
          }
          const resourceTiming = (resource) =>
            win.performance.getEntriesByType('resource').find((entry) => entry.name.includes(resource))
          results.pageloadTiming = win.performance.timing[endMark] - win.performance.timing[startMark]
          results.domCompleteTiming = navigationTiming?.domComplete || null
          results.resourceTiming = resourceTiming
          results.totalBytes = win.performance
            .getEntriesByType('resource')
            .reduce((acc, entry) => acc + entry.encodedBodySize, 0)
        })
        .then(
          (win) =>
            new Cypress.Promise((resolve, reject) => {
              const timeoutId = setTimeout(() => {
                resolve(results)
              }, timeout)

              if (!('PerformanceObserver' in win)) {
                clearTimeout(timeoutId)
                reject(new Error('PerformanceObserver not supported'))
                return
              }
              const entryTypes = ['largest-contentful-paint', 'longtask', 'paint', 'layout-shift']
              const observer = new win.PerformanceObserver((list) => {
                for (const type of entryTypes) {
                  const entries = list.getEntriesByType(type)
                  if (type === 'largest-contentful-paint') {
                    results.largestContentfulPaint = entries[entries.length - 1].startTime
                  } else if (type === 'longtask') {
                    let totalBlockingTime = 0
                    entries.forEach((perfEntry) => {
                      const blockingTime = Math.max(perfEntry.duration - 50, 0)
                      totalBlockingTime += blockingTime
                    })
                    results.totalBlockingTime = totalBlockingTime
                  } else if (type === 'paint') {
                    results.paint = {
                      firstPaint: entries.find((entry) => entry.name === 'first-paint').startTime,
                      firstContentfulPaint: entries.find((entry) => entry.name === 'first-contentful-paint').startTime,
                    }
                  } else if (type === 'layout-shift') {
                    let CLS = 0
                    entries.forEach((entry) => {
                      if (!entry.hadRecentInput) {
                        CLS += entry.value
                      }
                    })
                    results.cumulativeLayoutShift = CLS
                  }
                }
                observer.disconnect()
                clearTimeout(timeoutId)
                log.end()
                metrics = results
                resolve(results)
              })

              try {
                for (const type of entryTypes) {
                  observer.observe({ type, buffered: true })
                }
              } catch (err) {
                clearTimeout(timeoutId)
                reject(new Error(`Failed to observe ${entryTypes}: ${err.message}`))
              }
            }),
        )
    })
    .then((initialResults) =>
      cy
        .wrap(null, { timeout: retryTimeout })
        .should(() => {
          if (!hasValidMetrics(initialResults)) {
            throw new Error('Waiting for valid metrics...')
          }
        })
        .then(() => initialResults),
    )
})
