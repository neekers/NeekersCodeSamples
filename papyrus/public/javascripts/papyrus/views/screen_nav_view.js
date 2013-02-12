(function() {
  var ScreenNavView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  ScreenNavView = (function(_super) {

    __extends(ScreenNavView, _super);

    function ScreenNavView() {
      return ScreenNavView.__super__.constructor.apply(this, arguments);
    }

    ScreenNavView.prototype.className = "screen-nav";

    ScreenNavView.prototype.model = myd.ScreenModel;

    ScreenNavView.prototype.events = {
      'click a': 'scrollClick'
    };

    ScreenNavView.prototype.bindToModel = {
      "change:index": "reset"
    };

    ScreenNavView.prototype.initialize = function() {
      return this;
    };

    ScreenNavView.prototype.reset = function() {
      var parentEl, templateObj;
      parentEl = this.$el.parent();
      this.$el.remove();
      templateObj = this.model.toJSON();
      parentEl.append(Mustache.render($("#screen_nav_template").html(), templateObj));
      return this.setElement($(".screen-nav", parentEl));
    };

    ScreenNavView.prototype.scrollClick = function(event) {
      var itemEl, origin, screenItem;
      origin = event.target;
      if (origin.tagName.toLowerCase() !== "a") {
        origin = $(origin).closest("a");
      }
      screenItem = $(origin).attr('href').substring(1);
      itemEl = $("a[name='" + screenItem + "']");
      if (itemEl.length || screenItem === "top") {
        $("body, html").animate({
          'scrollTop': screenItem !== "top" ? itemEl.offset().top - 100 : 0
        }, 500, "easeOutCirc");
      }
      return false;
    };

    return ScreenNavView;

  })(Backbone.View);

  global.myd.ScreenNavView = ScreenNavView;

}).call(this);
