/**
 * A Nightwatch page object. The page object name is the filename.
 *
 * Usage:
 *   browser.page.google.search()
 *
 * See the example test using this object:
 *   specs/with-page-objects/google.js
 *
 * For more information on working with page objects, see:
 *   https://nightwatchjs.org/guide/concepts/page-object-model.html
 *
 */

const searchCommands = {
  submit() {
    this.waitForElementVisible("@submitButton", 1000).click("@submitButton");

    this.pause(1000);

    return this; // for command-chaining
  },
};

// page-objects/google/search.js
// page-objects/google/search.js
module.exports = {
  url: "https://www.google.com",
  elements: {
    searchBar: 'input[name="q"]', // Sélecteur mis à jour pour la barre de recherche
    submitButton: 'button[data-test-id="search-form-submit"]', // Sélecteur mis à jour pour le bouton de soumission
  },
  commands: [
    {
      submit() {
        this.waitForElementVisible("@submitButton", 10000).click(
          "@submitButton"
        );
        this.pause(1000);
        return this; // pour enchaîner les commandes
      },
    },
  ],
};
