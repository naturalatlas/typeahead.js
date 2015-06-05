var fixtures = fixtures || {};

fixtures.html = {
  textInput: '<input type="text">',
  input: '<input class="tt-input" type="text" autocomplete="false" spellcheck="false">',
  hint: '<input class="tt-hint" type="text" autocomplete="false" spellcheck="false" disabled>',
  menu: '<div class="tt-dropdown-menu"></div>',
  dataset: [
    '<div class="tt-dataset-test">',
      '<div class="tt-suggestions">',
        '<div class="tt-suggestion"><p>one</p></div>',
        '<div class="tt-suggestion"><p>two</p></div>',
        '<div class="tt-suggestion"><p>three</p></div>',
      '</div>',
    '</div>'
  ].join('')
};
