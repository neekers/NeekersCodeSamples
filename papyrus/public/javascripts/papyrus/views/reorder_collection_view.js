(function() {
  var ReorderCollectionView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  ReorderCollectionView = (function(_super) {

    __extends(ReorderCollectionView, _super);

    function ReorderCollectionView() {
      return ReorderCollectionView.__super__.constructor.apply(this, arguments);
    }

    ReorderCollectionView.prototype.collection = myd.GridCollection;

    ReorderCollectionView.prototype.id = "reorder";

    ReorderCollectionView.prototype.events = {
      'click .cancel-reorder-btn': 'clickedCancel',
      'click .done-reorder-btn': 'clickedDone'
    };

    ReorderCollectionView.prototype.initialize = function(params) {
      this.render();
      return this;
    };

    ReorderCollectionView.prototype.render = function() {
      var _this = this;
      this.overlay = new myd.OverlayView;
      $("#overlay").append(this.$el.append(Mustache.render($("#reorder_collection_template").html())));
      this.dragText = this.$el.find(".drag-text");
      this.list = this.$el.find("#reorder-list");
      _.each(this.collection.models, function(model) {
        return _this.list.append("<li data-id='" + (model.get("uid")) + "'>" + (myd.renderScreen(model.toJSON(), "reorder")) + "</li>");
      });
      this.list.sortable({
        placeholder: "ui-state-highlight",
        cursor: 'all-scroll',
        start: function() {
          return _this.dragText.css("visibility", "hidden");
        },
        stop: function() {
          return _this.dragText.css("visibility", "visible");
        }
      });
      this.list.disableSelection();
      return $("body").addClass("noscroll");
    };

    ReorderCollectionView.prototype.clickedCancel = function() {
      this.close();
      return false;
    };

    ReorderCollectionView.prototype.clickedDone = function() {
      var newOrderScreens,
        _this = this;
      newOrderScreens = [];
      _.each(this.list.find(" > li"), function(screen, idx) {
        var localScreen;
        localScreen = _this.collection.get($(screen).data("id"));
        return localScreen.set("index", idx, {
          silent: true
        });
      });
      this.collection.sort();
      this.collection.trigger('reordered');
      this.close();
      return false;
    };

    ReorderCollectionView.prototype.onClose = function() {
      $("body").removeClass("noscroll");
      return this.overlay.close();
    };

    return ReorderCollectionView;

  })(Backbone.View);

  global.myd.ReorderCollectionView = ReorderCollectionView;

}).call(this);
