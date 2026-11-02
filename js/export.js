// export.js - interface de l'export PDF
/* global TrelloPowerUp, CdfPdf */
(function () {
  'use strict';
  var t = TrelloPowerUp.iframe();
  var $ = function (id) { return document.getElementById(id); };
  var state = { lists: [], cards: [], labels: [], boardName: '' };
  var PREFS_KEY = 'pdfExportPrefs';

  function showError(msg) { var e = $('error'); e.textContent = msg; e.hidden = !msg; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function checked(container) {
    return Array.prototype.slice.call($(container).querySelectorAll('input:checked')).map(function (i) { return i.value; });
  }
  function setAll(container, v) {
    Array.prototype.forEach.call($(container).querySelectorAll('input'), function (i) { i.checked = v; });
    refresh();
  }

  function options() {
    return {
      title: $('title').value, listIds: checked('lists'), labelKeys: checked('labels'),
      from: $('from').value, to: $('to').value,
      includeNoDate: $('no-date').checked, includeDone: $('done').checked, includeLieu: $('lieu').checked,
      grouping: $('grouping').value
    };
  }

  function refresh() {
    var o = options();
    var d = CdfPdf.prepare(state.lists, state.cards, o);
    $('summary').textContent = d.total + ' carte' + (d.total > 1 ? 's' : '') + ' dans ' + o.listIds.length + ' colonne' + (o.listIds.length > 1 ? 's' : '');
    $('generate').disabled = d.total === 0;
  }

  function render(prefs) {
    var counts = {};
    state.cards.forEach(function (c) { if (!c.closed) counts[c.idList] = (counts[c.idList] || 0) + 1; });
    var known = prefs && prefs.knownListIds || [];
    $('lists').innerHTML = state.lists.map(function (l, i) {
      var on = !prefs || !prefs.listIds || known.indexOf(l.id) < 0 || prefs.listIds.indexOf(l.id) >= 0;
      var col = CdfPdf.LIST_COLORS[i % CdfPdf.LIST_COLORS.length];
      return '<label><input type="checkbox" value="' + esc(l.id) + '"' + (on ? ' checked' : '') + '>' +
        '<span class="dot" style="background:' + col + '"></span>' + esc(l.name) +
        ' <span class="count">(' + (counts[l.id] || 0) + ')</span></label>';
    }).join('') || 'Aucune colonne.';

    var seen = {}, labels = [];
    state.cards.forEach(function (c) {
      if (c.closed) return;
      (c.labels || []).forEach(function (l) { var k = CdfPdf.labelKey(l); if (!seen[k]) { seen[k] = 1; labels.push(l); } });
    });
    labels.sort(function (a, b) { return (a.name || '').localeCompare(b.name || '', 'fr'); });
    var sel = prefs && prefs.labelKeys || [];
    $('labels').innerHTML = labels.map(function (l) {
      var k = CdfPdf.labelKey(l), col = CdfPdf.trelloColor(l.color);
      var txt = l.name || '(sans nom)';
      return '<label><input type="checkbox" value="' + esc(k) + '"' + (sel.indexOf(k) >= 0 ? ' checked' : '') + '>' +
        '<span class="chip" style="background:' + col + ';color:' + (col > '#999999' ? '#172b4d' : '#fff') + '">' + esc(txt) + '</span></label>';
    }).join('') || '<span class="hint">Aucune étiquette sur ce tableau.</span>';

    if (prefs) {
      if (prefs.orientation) $('orientation').value = prefs.orientation;
      if (prefs.grouping) $('grouping').value = prefs.grouping;
      if (typeof prefs.includeNoDate === 'boolean') $('no-date').checked = prefs.includeNoDate;
      if (typeof prefs.includeDone === 'boolean') $('done').checked = prefs.includeDone;
      if (typeof prefs.includeLieu === 'boolean') $('lieu').checked = prefs.includeLieu;
    }
    refresh();
  }

  function savePrefs() {
    var o = options();
    return t.set('member', 'private', PREFS_KEY, {
      listIds: o.listIds, knownListIds: state.lists.map(function (l) { return l.id; }), labelKeys: o.labelKeys,
      orientation: $('orientation').value, grouping: o.grouping, includeNoDate: o.includeNoDate, includeDone: o.includeDone, includeLieu: o.includeLieu
    }).catch(function () {});
  }

  function generate() {
    showError('');
    if (!window.jspdf || !window.jspdf.jsPDF) { showError('La bibliothèque PDF n\'a pas pu être chargée (connexion ?). Rechargez la fenêtre.'); return; }
    var btn = $('generate'); btn.disabled = true; $('status').textContent = 'Génération en cours…';
    setTimeout(function () {
      try {
        var o = options();
        var data = CdfPdf.prepare(state.lists, state.cards, o);
        var doc = CdfPdf.build(window.jspdf.jsPDF, data, { orientation: $('orientation').value });
        doc.save(CdfPdf.fileName(data.title));
        $('status').textContent = 'PDF généré (' + data.total + ' cartes). Vérifiez vos téléchargements.';
        savePrefs();
      } catch (e) {
        console.error(e);
        $('status').textContent = '';
        showError('Erreur pendant la génération : ' + (e && e.message ? e.message : e));
      }
      btn.disabled = false; refresh();
    }, 30);
  }

  ['title', 'from', 'to', 'no-date', 'done', 'lieu', 'grouping'].forEach(function (id) {
    $(id).addEventListener('input', refresh); $(id).addEventListener('change', refresh);
  });
  $('lists').addEventListener('change', refresh);
  $('labels').addEventListener('change', refresh);
  $('lists-all').addEventListener('click', function () { setAll('lists', true); });
  $('lists-none').addEventListener('click', function () { setAll('lists', false); });
  $('labels-none').addEventListener('click', function () { setAll('labels', false); });
  $('generate').addEventListener('click', generate);

  t.render(function () {
    return Promise.all([
      t.lists('id', 'name'),
      t.cards('id', 'name', 'labels', 'closed', 'idList', 'url', 'due', 'dueComplete', 'locationName', 'address'),
      t.board('name'),
      t.get('member', 'private', PREFS_KEY, null)
    ]).then(function (r) {
      state.lists = r[0] || []; state.cards = r[1] || []; state.boardName = (r[2] && r[2].name) || '';
      if (!$('title').value) $('title').value = state.boardName;
      render(r[3]);
    }).catch(function (e) {
      console.error(e);
      showError('Impossible de lire le tableau : ' + (e && e.message ? e.message : e));
    });
  });
})();
