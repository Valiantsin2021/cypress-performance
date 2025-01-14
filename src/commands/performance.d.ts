interface NetworkConditions {
  offline: boolean
  downloadThroughput: number // bits per second
  uploadThroughput: number // bits per second
  latency: number // milliseconds
}

interface NetworkPreset {
  REGULAR_4G: NetworkConditions
  SLOW_3G: NetworkConditions
  FAST_3G: NetworkConditions
  FAST_WIFI: NetworkConditions
}

interface SetNetworkConditionsOptions {
  downloadThroughput: number // bits per second
  uploadThroughput: number // bits per second
  latency: number // milliseconds
}
declare namespace Cypress {
  interface Chainable {
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
    setNetworkConditions(preset: keyof NetworkPreset | SetNetworkConditionsOptions): Chainable
    /**
     * Reset network conditions to default
     */
    resetNetworkConditions(): Chainable
    /**
     * Unified command to get performance metrics or observe specific performance metrics.
     * @example
     * cy.performance({ startMark: 'navigationStart', endMark: 'loadEventEnd', timeout: 10000, initialDelay: 1000, retryTimeout: 5000 })
     *   .then(results => {
     *     expect(results.pageloadTiming).to.be.lessThan(2000);
     *     expect(results.domCompleteTiming).to.be.lessThan(2000);
     *     const logoResourceTiming = results.resourceTiming('.svg');
     *     expect(logoResourceTiming.duration, 'Resource timing is less than 500ms').to.be.lessThan(500);
     *     expect(results.totalBytes, 'Total bytes is less than 500kb').to.be.lessThan(500000);
     *   });
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
    performance(options?: {
      startMark?: keyof PerformanceTiming // Default: 'navigationStart'
      endMark?: keyof PerformanceTiming // Default: 'loadEventEnd'
      timeout?: number // Timeout in milliseconds (default: 10000)
      initialDelay?: number // Initial delay in milliseconds (default: 1000)
      retryTimeout?: number // Retry timeout in milliseconds (default: 5000)
    }): Chainable<{
      pageloadTiming: number
      domCompleteTiming: number | null
      resourceTiming: (resource: string) => PerformanceResourceTiming | undefined
      largestContentfulPaint: number
      totalBlockingTime: number
      paint: { firstContentfulPaint: number; firstPaint: number }
      timeToFirstByte: {
        total: number
        redirect: number
        dns: number
        connection: number
        tls: number
        wait: number
      }
      cumulativeLayoutShift: number
      totalBytes: number
    }>
  }
}
