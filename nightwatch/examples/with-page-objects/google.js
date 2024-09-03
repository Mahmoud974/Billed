/**
 * This example uses the page-objects defined at:
 *   page-objects/google/search.js
 *   page-objects/google/searchResults.js
 *
 *  For more information on working with page objects, see:
 *   https://nightwatchjs.org/guide/concepts/page-object-model.html
 *
 */

describe("Google search with consent form - page objects", function () {
  const homePage = browser.page.google.search(); // Premier objet de page

  before(async () => {
    await homePage.navigate();
    // Gérer le formulaire de consentement, si nécessaire
    // Exemple : await homePage.acceptConsentForm();
  });

  after(async (browser) => {
    await browser.quit();
  });

  it("should find nightwatch.js in results", function (browser) {
    // Attendez que la barre de recherche soit visible avant de définir une valeur
    homePage.waitForElementVisible("@searchBar", 10000);
    homePage.setValue("@searchBar", "Nightwatch.js");

    // Attendez que le bouton de soumission soit visible et cliquez dessus
    homePage.waitForElementVisible("@submitButton", 10000);
    homePage.click("@submitButton");

    // Attendez que les résultats soient visibles
    const resultsPage = browser.page.google.searchResults(); // Deuxième objet de page
    resultsPage.waitForElementVisible("@results", 10000);

    // Vérifiez que le texte attendu est présent
    resultsPage.expect.element("@results").text.to.contain("Nightwatch.js");

    // Vérifiez que la section du menu est visible
    resultsPage.expect.section("@menu").to.be.visible;

    // Vérifiez que l'élément des vidéos est visible
    const menuSection = resultsPage.section.menu;
    menuSection.expect.element("@videos").to.be.visible;
  });
});
