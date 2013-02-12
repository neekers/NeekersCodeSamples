(function() {
  var AddFeedView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  AddFeedView = (function(_super) {

    __extends(AddFeedView, _super);

    function AddFeedView() {
      return AddFeedView.__super__.constructor.apply(this, arguments);
    }

    AddFeedView.prototype.tagName = "div";

    AddFeedView.prototype.className = "screen-item add-asset feed-type cf";

    AddFeedView.prototype.collection = myd.ItemsCollection;

    AddFeedView.prototype.events = {
      'click .close-add-item': 'clickedClosed',
      'click .add-button': 'clickedAdd'
    };

    AddFeedView.prototype.initialize = function(params) {
      this.containerTarget = params.container;
      this.index = params.index;
      this.collection = new myd.ItemsCollection;
      this.collection.bind("reset", this.render, this);
      return this.collection.fetch("FeedAsset");
    };

    AddFeedView.prototype.render = function() {
      var likedItemsList,
        _this = this;
      this.template = $("#add_feed_item_template").html();
      this.$el.append(Mustache.render(this.template));
      this.$el.insertAfter(this.containerTarget);
      likedItemsList = this.$el.find("ul.liked-items");
      this.itemViews = [];
      _.each(this.collection.models, function(item) {
        var view;
        view = new myd.AddItemView({
          model: item
        });
        likedItemsList.append(view.el);
        view.bind("addItem", _this.addItem, _this);
        return _this.itemViews.push(view);
      });
      return this.$el.show("blind", 1000);
    };

    AddFeedView.prototype.addItem = function(item) {
      var url;
      if (!item) {
        url = this.$el.find('.feed_url').val();
        if (url.length < 1) {
          return;
        }
        item = new myd.ItemModel({
          asset_type: "feed",
          title: '',
          feed_url: url,
          type: "feed",
          index: this.index
        });
      } else {
        item.set('asset_type', 'feed');
        item.set('index', this.index);
      }
      this.trigger("addItem", item);
      return this.clickedClosed();
    };

    AddFeedView.prototype.clickedAdd = function() {
      this.addItem();
      return false;
    };

    AddFeedView.prototype.clickedClosed = function() {
      var _this = this;
      this.$el.hide("blind", 1000, function() {
        return _this.close();
      });
      return false;
    };

    AddFeedView.prototype.onClose = function() {};

    return AddFeedView;

  })(Backbone.View);

  global.myd.AddFeedView = AddFeedView;

}).call(this);
