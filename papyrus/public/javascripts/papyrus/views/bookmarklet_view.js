(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  global.myd.BookmarkletView = (function(_super) {

    __extends(BookmarkletView, _super);

    function BookmarkletView() {
      return BookmarkletView.__super__.constructor.apply(this, arguments);
    }

    BookmarkletView.prototype.tagName = "div";

    BookmarkletView.prototype.id = "bookmarklet";

    BookmarkletView.prototype.initialize = function() {
      $("#content").append(this.$el);
      this.template = $("#bookmarklet_view").html();
      return this.render();
    };

    BookmarkletView.prototype.display = function() {};

    BookmarkletView.prototype.render = function() {
      if (this.template != null) {
        this.$el.empty().append(Mustache.render(this.template, null));
      }
      return this;
    };

    return BookmarkletView;

  })(Backbone.View);

}).call(this);
