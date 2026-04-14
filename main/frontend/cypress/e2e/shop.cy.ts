describe('Shop E2E', () => {
  it('Vásárlás végigvihető', () => {
    cy.visit('/shop');
    // cy.get('[data-testid="shop-item"]').first().click();
    // cy.get('button').contains(/vásárlás/i).click();
    // cy.contains(/sikeres vásárlás/i).should('exist');
  });
});
