(function() {
  var inputModule, keyCodes, _ref;

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  keyCodes = {
    "return": 13,
    escape: 27,
    left: 37,
    up: 38,
    right: 39,
    down: 40
  };

  inputModule = {
    returnPress: function(event) {
      return event.keyCode === keyCodes["return"];
    },
    escapePress: function(event) {
      return event.keyCode === keyCodes.escape;
    },
    leftArrowPress: function(event) {
      return event.keyCode === keyCodes.left;
    },
    upArrowPress: function(event) {
      return event.keyCode === keyCodes.up;
    },
    rightArrowPress: function(event) {
      return event.keyCode === keyCodes.right;
    },
    downArrowPress: function(event) {
      return event.keyCode === keyCodes.down;
    }
  };

  global.myd.inputModule = inputModule;

}).call(this);
