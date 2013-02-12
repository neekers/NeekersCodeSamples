(function() {
  var ItemsCollection, _ref;

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  ItemsCollection = Backbone.Collection.extend({
    model: myd.ItemModel,
    fetched: false,
    initialize: function(params) {
      this.url = myd.urls.my_collected_items;
      return this;
    },
    fetch: function(assetType, url) {
      var _this = this;
      if (url == null) {
        url = this.url;
      }
      return myd.serviceModule.get({
        url: url,
        success: function(response) {
          var item, itemsList, screen;
          if (assetType !== "Collection" || url !== _this.url) {
            if (response.collection) {
              response.items = [];
              _.each(response.collection.screens, function(screen) {
                return response.items.push(screen.item);
              });
            }
            itemsList = (function() {
              var _i, _len, _ref1, _results;
              _ref1 = response.items;
              _results = [];
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                item = _ref1[_i];
                if (item.type === assetType) {
                  _results.push(item);
                }
              }
              return _results;
            })();
            _.each(response.items, function(item) {
              item.image_300_url = item.thumbnail_url;
              if (item.type.toLowerCase() === assetType.toLowerCase() || item.type + "asset" === assetType.toLowerCase()) {
                if (item.type.toLowerCase() === "collection" && (item.cover_asset != null)) {
                  item.image_300_url = item.cover_asset.thumbnail_url;
                } else if (item.type.toLowerCase() === "videoasset" && (item.youtube_id != null)) {
                  item.image_300_url = myd.getVideoUrl(item.youtube_id);
                }
                return itemsList.push(item);
              }
            });
            return _this.reset(_this.parse(itemsList));
          } else {
            itemsList = (function() {
              var _i, _len, _ref1, _results;
              _ref1 = response.collection.screens;
              _results = [];
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                screen = _ref1[_i];
                if (screen.item.type != null) {
                  _results.push(screen.item);
                }
              }
              return _results;
            })();
            return _this.reset(_this.parse(itemsList));
          }
        }
      });
    },
    fetchSearchResults: function(searchQuery) {
      var _this = this;
      return myd.serviceModule.get({
        url: myd.urls.search + searchQuery,
        success: function(response) {
          var items;
          items = [];
          _.each(response.collection.screens, function(screen) {
            return items.push({
              title: screen.title,
              image_300_url: screen.assets[0].thumbnail_url,
              asset_url: screen.assets[0].asset_url,
              type: "ImageAsset",
              search_origin: screen.search_origin,
              source_page_url: screen.assets[0].asset_url
            });
          });
          return _this.reset(_this.parse(items));
        }
      });
    }
  });

  global.myd.ItemsCollection = ItemsCollection;

}).call(this);
