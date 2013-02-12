(function() {
  var FrontMatterTileModel, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  FrontMatterTileModel = (function(_super) {

    __extends(FrontMatterTileModel, _super);

    function FrontMatterTileModel() {
      return FrontMatterTileModel.__super__.constructor.apply(this, arguments);
    }

    FrontMatterTileModel.prototype.idAttribute = "uid";

    FrontMatterTileModel.prototype.exists = function() {
      return this.get("type") != null;
    };

    FrontMatterTileModel.prototype.toggleLike = function() {
      var _this = this;
      return myd.serviceModule.post({
        url: myd.urls.bookmarks,
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

    return FrontMatterTileModel;

  })(Backbone.Model);

  global.myd.FrontMatterTileModel = FrontMatterTileModel;

}).call(this);
