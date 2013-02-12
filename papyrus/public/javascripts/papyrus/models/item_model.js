(function() {
  var ItemModel, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  ItemModel = (function(_super) {

    __extends(ItemModel, _super);

    function ItemModel() {
      return ItemModel.__super__.constructor.apply(this, arguments);
    }

    ItemModel.prototype.idAttribute = "uid";

    ItemModel.prototype.defaults = {
      metaData: void 0,
      type: "image"
    };

    ItemModel.prototype.initialize = function(options) {
      this.bookmark_url = myd.urls.bookmarks;
      if ((options != null) && (options.screen_id != null)) {
        return this.set('screen_id', options.screen_id);
      }
    };

    ItemModel.prototype.toggleLike = function() {
      var _this = this;
      return myd.serviceModule.post({
        url: this.bookmark_url,
        data: {
          entity_url: this.get("entity_url"),
          bookmarked: !this.get('collected')
        },
        success: function(response) {
          var newCount;
          newCount = _this.get("collected_count");
          if (response.collected) {
            _this.set("collected_count", ++newCount);
          } else {
            _this.set("collected_count", newCount > 0 ? --newCount : 0);
          }
          return _this.set('collected', response.collected);
        }
      });
    };

    ItemModel.prototype.fetchMetaData = function() {
      var _this = this;
      return myd.serviceModule.get({
        url: this.get("meta_data_url"),
        success: function(response) {
          return _this.set("metaData", response);
        }
      });
    };

    return ItemModel;

  })(Backbone.Model);

  global.myd.ItemModel = ItemModel;

}).call(this);
