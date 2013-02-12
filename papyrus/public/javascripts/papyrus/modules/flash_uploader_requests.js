(function() {
  var _ref;

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  global.myd.FlashUploaderRequest = function() {
    var closeWindow;
    closeWindow = function() {
      return $(".close-add-item").click();
    };
    return {
      closeWindow: closeWindow
    };
  };

}).call(this);
