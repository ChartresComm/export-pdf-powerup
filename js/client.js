// client.js - Power-Up "Export PDF du tableau"
/* global TrelloPowerUp */

// IMPORTANT : à adapter si votre dépôt GitHub ne s'appelle pas "export-pdf-powerup".
// Les icônes d'un bouton de tableau doivent être en URL ABSOLUE (https).
var BASE = 'https://chartrescomm.github.io/export-pdf-powerup';

var ICON = {
  dark: BASE + '/icons/icon-white-16.png',
  light: BASE + '/icons/icon-color-16.png'
};

TrelloPowerUp.initialize({
  'board-buttons': function (t, options) {
    return [{
      icon: ICON,
      text: 'Export PDF',
      callback: function (t) {
        return t.modal({
          url: './export.html',
          title: 'Export PDF du tableau',
          height: 680
        });
      }
    }];
  }
});
