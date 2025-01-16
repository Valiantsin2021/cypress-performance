/// <reference types="cypress" />

import '../../src/commands/index.js'
/**
 * Overwrites the default `log` command to also print the message to the terminal.
 *
 * @param {function} log - The original `log` function.
 * @param {string} message - The message to log.
 * @param {...*} args - Additional arguments to log.
 *
 * @example
 * cy.log('Hello, world!')
 */
Cypress.Commands.overwrite('log', (log, message, ...args) => {
  log(message, ...args)
  cy.task('print', [message, ...args].join(', '), { log: false })
})