describe('ApexRigel main flows', () => {
  it('loads dashboard and navigates to signup wizard', () => {
    cy.visit('/')
    cy.contains('Features').should('exist')
    cy.visit('/signup-wizard')
    cy.contains('Sign-Up Wizard').should('exist')
  })
})

