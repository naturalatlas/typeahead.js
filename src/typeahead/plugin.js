/*
 * typeahead.js
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
 */

(function() {
  'use strict';

  var old, keys, methods;

  old = $.fn.typeahead;

  keys = {
    www: 'tt-www',
    attrs: 'tt-attrs',
    typeahead: 'tt-typeahead'
  };

  methods = {
    // supported signatures:
    // function(o, dataset, dataset, ...)
    // function(o, [dataset, dataset, ...])
    initialize: function initialize(o, datasets) {
      var www;

      datasets = _.isArray(datasets) ? datasets : [].slice.call(arguments, 1);

      o = o || {};
      www = WWW(o.classNames);

      return this.each(attach);

      function attach() {
        var $input, $wrapper, $hint, $results, defaultHint, defaultResults,
            eventBus, input, results, typeahead, ResultsConstructor;

        // highlight is a top-level config that needs to get inherited
        // from all of the datasets
        _.each(datasets, function(d) { d.highlight = !!o.highlight; });

        $input = $(this);
        $wrapper = $(www.html.wrapper);
        $hint = isDom(o.hint) ? $(o.hint).first() : null;
        $results = isDom(o.results) ? $(o.results).first() : null;

        defaultHint = o.hint !== false && !$hint;
        defaultResults = o.results !== false && !$results;

        defaultHint && ($hint = buildHintFromInput($input, www));
        defaultResults && ($results = $(www.html.results).css(www.css.results));

        // hint should be empty on init
        $hint && $hint.val('');
        $input = prepInput($input);

        // only apply inline styles and make dom changes if necessary
        if (defaultHint || defaultResults) {
          $wrapper.css(www.css.wrapper);
          $input.css(defaultHint ? www.css.input : www.css.inputWithNoHint);

          $input
          .wrap($wrapper)
          .parent()
          .prepend(defaultHint ? $hint : null)
          .append(defaultResults ? $results : null);
        }

        ResultsConstructor = defaultResults ? DefaultResults : Results;

        eventBus = new EventBus({ el: $input });
        input = new Input({ hint: $hint, input: $input, }, www);
        results = new ResultsConstructor({
          node: $results,
          datasets: datasets
        }, www);

        typeahead = new Typeahead({
          input: input,
          results: results,
          eventBus: eventBus,
          minLength: o.minLength
        }, www);

        $input.data(keys.www, www);
        $input.data(keys.typeahead, typeahead);
      }
    },

    isEnabled: function isEnabled() {
      var enabled;

      ttEach(this.first(), function(t) { enabled = t.isEnabled(); });
      return enabled;
    },

    enable: function enable() {
      ttEach(this, function(t) { t.enable(); });
      return this;
    },

    disable: function disable() {
      ttEach(this, function(t) { t.disable(); });
      return this;
    },

    isActive: function isActive() {
      var active;

      ttEach(this.first(), function(t) { active = t.isActive(); });
      return active;
    },

    activate: function activate() {
      ttEach(this, function(t) { t.activate(); });
      return this;
    },

    deactivate: function deactivate() {
      ttEach(this, function(t) { t.deactivate(); });
      return this;
    },

    isOpen: function isOpen() {
      var open;

      ttEach(this.first(), function(t) { open = t.isOpen(); });
      return open;
    },

    open: function open() {
      ttEach(this, function(t) { t.open(); });
      return this;
    },

    close: function close() {
      ttEach(this, function(t) { t.close(); });
      return this;
    },

    select: function select(el) {
      var success = false, $el = $(el);

      ttEach(this.first(), function(t) { success = t.select($el); });
      return success;
    },

    autocomplete: function autocomplete(el) {
      var success = false, $el = $(el);

      ttEach(this.first(), function(t) { success = t.autocomplete($el); });
      return success;
    },

    moveCursor: function moveCursoe(delta) {
      var success = false;

      ttEach(this.first(), function(t) { success = t.moveCursor(delta); });
      return success;
    },

    // mirror jQuery#val functionality: reads opearte on first match,
    // write operates on all matches
    val: function val(newVal) {
      var query;

      if (!arguments.length) {
        ttEach(this.first(), function(t) { query = t.getVal(); });
        return query;
      }

      else {
        ttEach(this, function(t) { t.setVal(newVal); });
        return this;
      }
    },

    destroy: function destroy() {
      ttEach(this, function(typeahead, $input) {
        revert($input);
        typeahead.destroy();
      });

      return this;
    }
  };

  $.fn.typeahead = function(method) {
    // methods that should only act on intialized typeaheads
    if (methods[method]) {
      return methods[method].apply(this, [].slice.call(arguments, 1));
    }

    else {
      return methods.initialize.apply(this, arguments);
    }
  };

  $.fn.typeahead.noConflict = function noConflict() {
    $.fn.typeahead = old;
    return this;
  };

  // helper methods
  // --------------

  function ttEach($els, fn) {
    $els.each(function() {
      var $input = $(this), typeahead;

      (typeahead = $input.data(keys.typeahead)) && fn(typeahead, $input);
    });
  }

  function buildHintFromInput($input, www) {
    return $input.clone()
    .addClass('tt-hint')
    .removeData()
    .css(www.css.hint)
    .css(getBackgroundStyles($input))
    .prop('readonly', true)
    .removeAttr('id name placeholder required')
    .attr({ autocomplete: 'off', spellcheck: 'false', tabindex: -1 });
  }

  function prepInput($input) {
    // store the original values of the attrs that get modified
    // so modifications can be reverted on destroy
    $input.data(keys.attrs, {
      dir: $input.attr('dir'),
      autocomplete: $input.attr('autocomplete'),
      spellcheck: $input.attr('spellcheck'),
      style: $input.attr('style')
    });

    $input
    .addClass('tt-input')
    .attr({ autocomplete: 'off', spellcheck: false });

    // ie7 does not like it when dir is set to auto
    try { !$input.attr('dir') && $input.attr('dir', 'auto'); } catch (e) {}

    return $input;
  }

  function getBackgroundStyles($el) {
    return {
      backgroundAttachment: $el.css('background-attachment'),
      backgroundClip: $el.css('background-clip'),
      backgroundColor: $el.css('background-color'),
      backgroundImage: $el.css('background-image'),
      backgroundOrigin: $el.css('background-origin'),
      backgroundPosition: $el.css('background-position'),
      backgroundRepeat: $el.css('background-repeat'),
      backgroundSize: $el.css('background-size')
    };
  }

  function revert($input) {
    var www, $wrapper;

    www = $input.data(keys.www);
    $wrapper = $input.parent().filter(www.selectors.wrapper);

    // need to remove attrs that weren't previously defined and
    // revert attrs that originally had a value
    _.each($input.data(keys.attrs), function(val, key) {
      _.isUndefined(val) ? $input.removeAttr(key) : $input.attr(key, val);
    });

    $input
    .removeData(keys.typeahead)
    .removeData(keys.www)
    .removeData(keys.attr)
    .removeClass(www.classes.input);

    if ($wrapper.length) {
      $input.detach().insertAfter($wrapper);
      $wrapper.remove();
    }
  }

  function isDom(obj) { return _.isJQuery(obj) || _.isElement(obj); }
})();
