declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to print to console log
     * @example cy.print({ foo: 'bar' })
     */
    print(object: object): void
  }
}
