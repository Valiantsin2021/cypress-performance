/// <reference types="cypress" />

/**
 * Set network conditions using Chrome DevTools Protocol
 * @example
 * cy.setNetworkConditions('SLOW_3G')
 * @example
 * cy.setNetworkConditions({
 *   downloadThroughput: 32768, // 32KB/s
 *   uploadThroughput: 16384,   // 16KB/s
 *   latency: 200              // 200ms
 * })
 */
Cypress.Commands.add('setNetworkConditions', (preset) => {
  const presets = {
    REGULAR_4G: {
      offline: false,
      downloadThroughput: (4 * 1024 * 1024) / 8, // 4 Mbps
      uploadThroughput: (3 * 1024 * 1024) / 8, // 3 Mbps
      latency: 20 // ms
    },
    SLOW_3G: {
      offline: false,
      downloadThroughput: (500 * 1024) / 8, // 500 Kbps
      uploadThroughput: (500 * 1024) / 8, // 500 Kbps
      latency: 100 // ms
    },
    FAST_3G: {
      offline: false,
      downloadThroughput: (1.5 * 1024 * 1024) / 8, // 1.5 Mbps
      uploadThroughput: (750 * 1024) / 8, // 750 Kbps
      latency: 150
    },
    FAST_WIFI: {
      offline: false,
      downloadThroughput: (400 * 1024 * 1024) / 8, // 400 Mbps
      uploadThroughput: (200 * 1024 * 1024) / 8, // 200 Mbps
      latency: 2 // ms
    }
  }

  const conditions = typeof preset === 'string' ? presets[preset] : preset

  if (!conditions) {
    throw new Error(`Unknown network preset: ${preset}`)
  }

  Cypress.automation('remote:debugger:protocol', {
    command: 'Network.enable'
  })
  Cypress.automation('remote:debugger:protocol', {
    command: 'Network.emulateNetworkConditions',
    params: {
      offline: false,
      latency: conditions.latency,
      downloadThroughput: conditions.downloadThroughput,
      uploadThroughput: conditions.uploadThroughput
    }
  })
})

/**
 * Reset network conditions to default
 */
Cypress.Commands.add('resetNetworkConditions', () => {
  Cypress.automation('remote:debugger:protocol', {
    command: 'Network.emulateNetworkConditions',
    params: {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1
    }
  })
  Cypress.automation('remote:debugger:protocol', {
    command: 'Network.disable'
  })
})
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
 * cy.setNetworkConditions('SLOW_3G')
 * cy.visit('https://www.google.com')
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
 * cy.resetNetworkConditions()
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
        yielded: metrics
      }
    }
  })

  const {
    startMark = 'navigationStart',
    endMark = 'loadEventEnd',
    timeout = 10000,
    initialDelay = 1000,
    retryTimeout = 5000
  } = options
  const results = {}
  const hasValidMetrics = (results) =>
    results.domCompleteTiming !== undefined &&
    results.largestContentfulPaint !== undefined &&
    results.totalBlockingTime !== undefined &&
    results.paint?.firstContentfulPaint !== undefined &&
    results.paint?.firstPaint !== undefined
  return cy
    .wait(initialDelay)
    .then(() => {
      cy.window(logFalse)
        .then((win) => {
          const navigationTiming = win.performance.getEntriesByType('navigation')[0]
          if (navigationTiming) {
            Cypress.log({
              name: 'Time to first byte: total',
              message: `Start: ${navigationTiming.startTime} End: ${navigationTiming.responseStart} Duration: ${navigationTiming.responseStart - navigationTiming.startTime}ms`
            })
            Cypress.log({
              name: 'Time to first byte: connection',
              message: `Start: ${navigationTiming.connectStart} End: ${navigationTiming.connectEnd} Duration: ${navigationTiming.connectEnd - navigationTiming.connectStart}ms`
            })
            Cypress.log({
              name: 'Time to first byte: redirect',
              message: `Start: ${navigationTiming.redirectStart} End: ${navigationTiming.redirectEnd} Duration: ${navigationTiming.redirectEnd - navigationTiming.redirectStart}ms`
            })
            Cypress.log({
              name: 'Time to first byte: dns',
              message: `Start: ${navigationTiming.domainLookupStart} End: ${navigationTiming.domainLookupEnd} Duration: ${navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart}ms`
            })
            Cypress.log({
              name: 'Time to first byte: tls',
              message: `Start: ${navigationTiming.secureConnectionStart} End: ${navigationTiming.connectEnd} Duration: ${navigationTiming.connectEnd - navigationTiming.secureConnectionStart}ms`
            })
            Cypress.log({
              name: 'Time to first byte: wait',
              message: `Start: ${navigationTiming.requestStart} End: ${navigationTiming.responseStart} Duration: ${navigationTiming.responseStart - navigationTiming.requestStart}ms`
            })
            results.timeToFirstByte = {
              total: navigationTiming.responseStart - navigationTiming.startTime,
              redirect: navigationTiming.redirectEnd - navigationTiming.redirectStart,
              dns: navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart,
              connection: navigationTiming.connectEnd - navigationTiming.connectStart,
              tls:
                navigationTiming.secureConnectionStart > 0
                  ? navigationTiming.connectEnd - navigationTiming.secureConnectionStart
                  : 0,
              wait: navigationTiming.responseStart - navigationTiming.requestStart
            }
          }
          const resourceTiming = (resource) =>
            win.performance.getEntriesByType('resource').find((entry) => entry.name.includes(resource))
          Cypress.log({
            name: 'Page Load Timing: total',
            message: `Start: ${win.performance.timing[startMark]} End: ${win.performance.timing[endMark]} Duration: ${win.performance.timing[endMark] - win.performance.timing[startMark]}ms`
          })
          Cypress.log({
            name: 'Dom Complete Timing',
            message: `Duration: ${navigationTiming?.domComplete}ms`
          })
          Cypress.log({
            name: 'Total Bytes',
            message: `${win.performance.getEntriesByType('resource').reduce((acc, entry) => acc + entry.encodedBodySize, 0)}bytes`
          })
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
                  try {
                    if (type === 'largest-contentful-paint') {
                      Cypress.log({
                        name: 'Largest Contentful Paint Timing',
                        message: `Duration: ${entries[entries.length - 1]?.duration}ms`
                      })
                      results.largestContentfulPaint = entries[entries.length - 1].startTime
                    } else if (type === 'longtask') {
                      let totalBlockingTime = 0
                      entries.forEach((perfEntry) => {
                        const blockingTime = Math.max(perfEntry?.duration - 50, 0)
                        totalBlockingTime += blockingTime
                      })
                      Cypress.log({
                        name: 'Total Blocking Time',
                        message: `Duration: ${totalBlockingTime}ms`
                      })
                      results.totalBlockingTime = totalBlockingTime
                    } else if (type === 'paint') {
                      Cypress.log({
                        name: 'First Paint',
                        message: `Duration: ${entries.find((entry) => entry.name === 'first-paint').startTime}ms`
                      })
                      Cypress.log({
                        name: 'First Contentful Paint',
                        message: `Duration: ${entries.find((entry) => entry.name === 'first-contentful-paint').startTime}ms`
                      })
                      results.paint = {
                        firstPaint: entries.find((entry) => entry.name === 'first-paint').startTime,
                        firstContentfulPaint: entries.find((entry) => entry.name === 'first-contentful-paint').startTime
                      }
                    } else if (type === 'layout-shift') {
                      let CLS = 0
                      entries.forEach((entry) => {
                        if (!entry.hadRecentInput) {
                          CLS += entry.value
                        }
                      })
                      Cypress.log({
                        name: 'Cumulative Layout Shift',
                        message: `Duration: ${CLS}`
                      })
                      results.cumulativeLayoutShift = CLS
                    }
                  } catch (err) {
                    Cypress.log({
                      name: type,
                      message: err.message
                    })
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
            })
        )
    })
    .then((initialResults) =>
      cy
        .wrap(null, { timeout: retryTimeout, log: false })
        .should(() => {
          if (!hasValidMetrics(initialResults)) {
            throw new Error('Waiting for valid metrics...')
          }
        })
        .then(() => initialResults)
    )
})
