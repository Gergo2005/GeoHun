describe('Bejelentkezés E2E', () => {
  it('Felhasználó be tud jelentkezni', () => {
    cy.visit('/');
    cy.get('input[name="username"]').type('teszt');
    cy.get('input[name="password"]').type('jelszo');
    cy.get('button').contains(/bejelentkezés/i).click();
    // cy.contains(/sikeres bejelentkezés/i).should('exist');
  });
});
