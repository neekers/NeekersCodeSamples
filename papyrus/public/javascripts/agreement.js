(function() {
  var Agreement, _ref, _ref1;

  if ((_ref = this.global) == null) {
    this.global = {};
  }

  if ((_ref1 = global.myd) == null) {
    global.myd = {};
  }

  Agreement = (function() {

    function Agreement() {
      var _this = this;
      $('.button.accept').click(function() {
        return $('#nda-form').submit();
      });
      $('#agreement-link').click(function() {
        return $('.agreement-wrapper .overlay').show();
      });
      $('.close').click(function() {
        return $('.agreement-wrapper .overlay').hide();
      });
    }

    return Agreement;

  })();

  global.myd.Agreement = Agreement;

  new global.myd.Agreement();

}).call(this);
