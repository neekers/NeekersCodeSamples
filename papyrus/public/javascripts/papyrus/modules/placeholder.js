(function() {
  var _ref;

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  global.myd.Placeholder = function() {
    var cleanPlaceholder, refreshPlaceholders;
    refreshPlaceholders = function(parentEl) {
      $('[placeholder]', parentEl).each(function() {
        var input;
        if ($(this).is("input")) {
          input = $(this);
          if (input.val().trim() === '' || input.val().trim() === input.attr('placeholder')) {
            return input.addClass('placeholder').val(input.attr('placeholder'));
          }
        } else {
          input = $(this);
          if (input.text().trim() === '' || input.text().trim() === input.attr('placeholder')) {
            return input.addClass('placeholder').text(input.attr('placeholder'));
          }
        }
      });
      return $('[placeholder]').focus(function() {
        var input;
        if ($(this).is("input")) {
          input = $(this);
          if (input.val() === input.attr('placeholder')) {
            return input.val('').removeClass('placeholder');
          }
        } else {
          input = $(this);
          if (input.text() === input.attr('placeholder')) {
            input.text('').removeClass('placeholder');
          }
          return this.focus();
        }
      }).blur(function() {
        var input;
        if ($(this).is("input")) {
          input = $(this);
          if (input.val() === '' || input.val() === input.attr('placeholder')) {
            return input.addClass('placeholder').val(input.attr('placeholder'));
          }
        } else {
          input = $(this);
          if (input.text() === '' || input.text() === input.attr('placeholder')) {
            return input.addClass('placeholder').text(input.attr('placeholder'));
          }
        }
      }).blur().parents('form').submit(function() {
        return $(this).find('[placeholder]').each(function() {
          var input;
          if ($(this).is("input")) {
            input = $(this);
            if (input.val() === input.attr('placeholder')) {
              return input.val('');
            }
          } else {
            input = $(this);
            if (input.text() === input.attr('placeholder')) {
              return input.text('');
            }
          }
        });
      });
    };
    cleanPlaceholder = function(parentEl) {
      return $('[placeholder]', parentEl).each(function() {
        var input;
        if ($(this).is("input")) {
          input = $(this);
          if (input.val() === input.attr('placeholder')) {
            return input.val('');
          }
        } else {
          input = $(this);
          if (input.text() === input.attr('placeholder')) {
            return input.text('');
          }
        }
      });
    };
    return {
      refresh: refreshPlaceholders,
      clean: cleanPlaceholder
    };
  };

}).call(this);
