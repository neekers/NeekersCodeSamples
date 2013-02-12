(function() {
  var OverlayView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  OverlayView = (function(_super) {

    __extends(OverlayView, _super);

    function OverlayView() {
      return OverlayView.__super__.constructor.apply(this, arguments);
    }

    OverlayView.prototype.events = {
      "click": "clickedClose"
    };

    OverlayView.prototype.initialize = function() {
      return this.render();
    };

    OverlayView.prototype.render = function() {
      $("body").addClass("noscroll").append("<div id='overlay'>");
      this.setElement($("#overlay"));
      return window.setTimeout(function() {
        return $("#overlay").addClass("activated");
      }, 200);
    };

    OverlayView.prototype.clickedClose = function() {
      this.trigger("clickedClose");
      return false;
    };

    OverlayView.prototype.onClose = function() {
      return $("body").removeClass("noscroll");
    };

    return OverlayView;

  })(Backbone.View);

  global.myd.OverlayView = OverlayView;

}).call(this);
