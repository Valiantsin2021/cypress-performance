<h1 align="center">cypress-performance</h1>
<p align="center">
   <a href="https://github.com/Valiantsin2021/cypress-performance/tags/"><img src="https://img.shields.io/github/tag/Valiantsin2021/cypress-performance" alt="cypress-performance versions" /></a>
   <a href="https://www.npmjs.com/package/cypress-performance"><img alt="cypress-performance available on NPM" src="https://img.shields.io/npm/dy/cypress-performance"></a>
   <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs are welcome" /></a>
   <a href="https://github.com/Valiantsin2021/cypress-performance/issues/"><img src="https://img.shields.io/github/issues/Valiantsin2021/cypress-performance" alt="cypress-performance issues" /></a>
   <img src="https://img.shields.io/github/stars/Valiantsin2021/cypress-performance" alt="cypress-performance stars" />
   <img src="https://img.shields.io/github/forks/Valiantsin2021/cypress-performance" alt="cypress-performance forks" />
   <img src="https://img.shields.io/github/license/Valiantsin2021/cypress-performance" alt="cypress-performance license" />
   <a href="https://GitHub.com/Valiantsin2021/cypress-performance/graphs/commit-activity"><img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" alt="cypress-performance is maintained" /></a>
   <a href="https://github.com/Valiantsin2021/cypress-performance"><img src="https://img.shields.io/badge/Author-Valentin%20Lutchanka-blue" alt="cypress-performance author" /></a>
   <a href="https://github.com/Valiantsin2021/cypress-performance/actions/workflows/ci.yml"><img src="https://github.com/Valiantsin2021/cypress-performance/actions/workflows/ci.yml/badge.svg?branch=main" alt="cypress-performance ci tests" /></a>
   <a href="https://img.shields.io/badge/cypress-13.7.0-brightgreen"><img src="https://img.shields.io/badge/cypress-13.7.0-brightgreen" alt="cypress-performance cypress version" /></a>
</p>

---


## Concept

The cypress-performance plugin introduces a powerful way to measure and assert on web performance metrics directly in your Cypress tests. Unlike traditional end-to-end testing that focuses on functionality, this plugin enables teams to catch performance regressions early and maintain high performance standards through automated testing.

This plugin does not have external dependencies.

**Comparison with @cypress-audit/lighthouse**

Both plugins focus on performance testing, but they serve different purposes:

**cypress-performance**

- **Real-time metrics** during test execution
- **Lower overhead** - no need for separate Lighthouse runs
- **Less configuration** - minimal setup required for basic usage
- **Specific metric focus** - [Core Web Vitals](https://www.hostinger.com/tutorials/core--web-vitals) and key timings
- **Test integration** - natural fit in existing test flows
- **Retry capability** - built-in retriability mechanisms to ensure the metrics are collected
- **Resource timing** - detailed resource-level metrics
- **Total bytes** - size of all resources
- **Time to first byte** - detailed time to first byte metrics
- **Network throttling** - support for throttling network conditions with presets or custom options

**@cypress-audit/lighthouse**

- **Comprehensive audits** including SEO, accessibility
- **Scoring system** aligned with Lighthouse
- **Static analysis** of best practices
- **Recommendations** for improvements
- **Performance simulation** under various conditions
- **Broader metrics** beyond just performance

**Key Features**

- Real-time performance metrics collection during test execution
- Built-in retry mechanisms for reliable measurements
- Support for Core Web Vitals and other key performance indicators
- Seamless integration with existing Cypress tests
- Type definitions for TypeScript support
- Configurable thresholds and timing options
- Support for throttling network conditions with presets or custom options

##### The "cy.performance" command provided by the plugin is chainable and returns the object containing the collected performance metrics:

```
  PerformanceMetrics {
      pageloadTiming: number
      domCompleteTiming: number | null
      resourceTiming: (resource: string) => PerformanceResourceTiming | undefined
      largestContentfulPaint: number
      totalBlockingTime: number
      paint: { firstContentfulPaint: number; firstPaint: number }
      cumulativeLayoutShift: number
      totalBytes: number
      timeToFirstByte: {
        total: number
        redirect: number
        dns: number
        connection: number
        tls: number
        wait: number
      }
    }
```
##### The "cy.setNetworkConditions" command provided by the plugin accepts the name of a network condition preset or custom options and applies it to the current test run.

Available Presets: 
- REGULAR_4G
- SLOW_3G
- FAST_3G
- FAST_WIFI

```typescript
  cy.setNetworkConditions('FAST_WIFI');
  // or custom options
  cy.setNetworkConditions({
    downloadThroughput: 32768, // 32KB/s
    uploadThroughput: 16384,   // 16KB/s
    latency: 200              // 200ms
  })
```

#####  The "cy.resetNetworkConditions" command provided by the plugin resets the network conditions to their default values.

This command normally should be placed at the end of the test suite or in the after hook to ensure that the network conditions are reset to their default values after each test.

**Available Metrics**

| **Metric** | **Description** | **Typical Threshold** |
| --- | --- | --- |
| largestContentfulPaint | Time until largest content element is visible | < 2500ms |
| totalBlockingTime | Sum of blocking time for long tasks | < 300ms |
| cumulativeLayoutShift | Measure of visual stability | < 0.1 |
| paint.firstContentfulPaint | Time until first meaningful content appears | < 1800ms |
| paint.firstPaint | Time until first pixel is painted | < 1000ms |
| pageloadTiming | Total page load time | < 3000ms |
| domCompleteTiming | Time until DOM is fully loaded | < 2500ms |
| resourceTiming | Time until resource is fully loaded | < 500ms |
| totalBytes | Size of all resources | < 1.5 MB |
| timeToFirstByte.total | Time to first byte | < 500ms |
| timeToFirstByte.dns | DNS time | < 20ms |
| timeToFirstByte.wait | Wait time | < 50ms |
| timeToFirstByte.redirect | Redirect time | < 50ms |
| timeToFirstByte.tls | TLS time | < 50ms |
| timeToFirstByte.connection | Connection time | < 50ms |

## Install

First things first, there's always something before you can start.

To make our life easier, we use NPM a lot. Make sure you have it installed.

Add this package as a dev dependency:

```sh
$ npm i -D cypress-performance
# or using Yarn
$ yarn add -D cypress-performance
```

Include this package in your spec or support file to use all custom query commands

```js
import 'cypress-performance'
```

## API

**Usage**

**Known issues**

1. TimeToFirstByte is not capturing DNS, connection, and TLS times always returning 0.
    "dns": 0,
    "connection": 0,
    "tls": 0,

2. cy.setNetworkConditions doesn't work properly in headed mode (only the first test run with the emulated network conditions). It works fine in headless mode using ```npx cypress run``` command.

Default options for the command cy.performance():

```
    MetricsOptions{
      startMark?: keyof PerformanceTiming // Default: 'navigationStart'
      endMark?: keyof PerformanceTiming // Default: 'loadEventEnd'
      timeout?: number // Timeout in milliseconds (default: 10000)
      initialDelay?: number // Initial delay in milliseconds (default: 1000)
      retryTimeout?: number // Retry timeout in milliseconds (default: 5000)
    }

```

Possible options for the command cy.setNetworkConditions():

Presets: 

- REGULAR_4G - 4 Mbps
- SLOW_3G - 500 Kbps
- FAST_3G - 1.5 Mbps
- FAST_WIFI - 400 Mbps

Options:

```
NetworkConditions {
  offline: boolean
  downloadThroughput: number // bits per second
  uploadThroughput: number // bits per second
  latency: number // milliseconds
}
```

Usage example:

```js
     // with custom options values
     cy.visit('https://example.com');
     cy.performance({ startMark: 'navigationStart', endMark: 'loadEventEnd', timeout: 10000, initialDelay: 1000, retryTimeout: 5000 })
       .then(results => {
         expect(results.pageloadTiming).to.be.lessThan(2000);
         expect(results.domCompleteTiming).to.be.lessThan(2000);
         const logoResourceTiming = results.resourceTiming('.svg');
         expect(logoResourceTiming.duration, 'Resource timing is less than 500ms').to.be.lessThan(500);
         expect(results.totalBytes, 'Total bytes is less than 500kb').to.be.lessThan(500000);
       });

    // or with default options values

     cy.visit('https://example.com').performance().then(results => { // the command is chainable
       expect(results.largestContentfulPaint).to.be.lessThan(500);
       expect(results.totalBlockingTime).to.be.lessThan(500);
       expect(results.paint.firstContentfulPaint).to.be.lessThan(500);
       expect(results.paint.firstPaint).to.be.lessThan(500);
       expect(results.cumulativeLayoutShift).to.be.lessThan(0.1);
       expect(metrics.timeToFirstByte.total, 'Time to first byte is less than 500ms').to.be.lessThan(500);
       expect(metrics.timeToFirstByte.dns, 'DNS time is less than 20ms').to.be.lessThan(20);
       expect(metrics.timeToFirstByte.wait, 'Wait time is less than 50ms').to.be.lessThan(50);
       expect(metrics.timeToFirstByte.redirect, 'Redirect time is less than 50ms').to.be.lessThan(50);
       expect(metrics.timeToFirstByte.tls, 'TLS time is less than 50ms').to.be.lessThan(50);
       expect(metrics.timeToFirstByte.connection, 'Connection time is less than 50ms').to.be.lessThan(50);
     });

    it(`using preset SLOW_3G`, () => {
      // Using setNetworkConditions should be called first before navigating to the page
      cy.setNetworkConditions('SLOW_3G')
      cy.visit(url)
      cy.performance().then((metrics) => {
        expect(metrics.pageloadTiming).to.be.greaterThan(12000)
        expect(metrics.domCompleteTiming).to.be.greaterThan(12000)
      })
      cy.resetNetworkConditions()
  })
```

**Command Retryability**

The cy.performance() command implements two levels of reliability:

1. **Command Level Retry**
    - Built into Cypress's command chain
    - Retries until valid metrics are available
    - Configurable via retryTimeout
    - Handles race conditions and timing issues
2. **Measurement Reliability**
    - Initial delay ensures stable measurements
    - Buffered performance entries capture early events
    - Multiple samples for metrics like CLS
    - Automatic fallbacks for missing metrics

## Types

This package includes TypeScript command definitions for its custom commands in the file [src/commands/performance.d.ts](./src/commands/performance.d.ts). To use it from your JavaScript specs:

```js
/// <reference types="cypress-performance" />
```

If you are using TypeScript, include this module in your types list

```json
{
  "compilerOptions": {
    "types": ["cypress", "cypress-performance"]
  }
}
```

## Contributions

Contributions are welcome! To contribute:

1.Fork the repository.

2.Create a feature branch:
   
```bash
  git checkout -b feature/your-feature-name
```

3.Commit your changes and push:

```bash
  git commit -m "Add new feature"
  git push origin feature/your-feature-name
```

4.Open a pull request:

## 5. License

This project is licensed under the MIT License.

## 6. Feedback

If you encounter any issues or have suggestions, please open an issue on GitHub.
